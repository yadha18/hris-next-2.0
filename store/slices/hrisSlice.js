// store/slices/hrisSlice.js
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import {
  KaryawanModel,
  LogChangeModel,
  LemburModel,
  LaptopModel,
} from "@/lib/models";
import { getTodayDate, monthsSince } from "@/lib/utils";
import {
  getMostCommonValue,
  isLaptopSerialReleased,
  findKaryawanByNIP,
} from "@/lib/selectors";
import { CONFIG } from "@/lib/config";

const DEFAULT_STATE = {
  karyawan: [],
  jabatan: [],
  log: [],
  slotConfig: {},
  lembur: [],
  lemburSbuConfig: {},
  tiketHPI: 0,
  laptop: [],
  subBidang: [],
};

// ── Thunks (sinkron ke MongoDB via /api/state) ─────────────────────────

export const fetchState = createAsyncThunk("hris/fetchState", async () => {
  const res = await fetch("/api/state");
  if (!res.ok) throw new Error("Gagal memuat data");
  return res.json();
});

export const saveState = createAsyncThunk(
  "hris/saveState",
  async (_, { getState }) => {
    const { hris } = getState();
    const { status, error, ...dataToSave } = hris;
    const res = await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSave),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data");
    return res.json();
  },
);

// ── Slice ───────────────────────────────────────────────────────────────

const hrisSlice = createSlice({
  name: "hris",
  initialState: { ...DEFAULT_STATE, status: "idle", error: null },
  reducers: {
    // ── Karyawan ──────────────────────────────────────────
    setSubBidang(state, action) {
      state.subBidang = action.payload;
    },

    repairDuplicateIds(state) {
      const seen = new Set();
      state.karyawan.forEach((k) => {
        if (seen.has(k.id)) k.id = Date.now() + Math.random();
        seen.add(k.id);
      });
    },

    addKaryawan: {
      reducer(state, action) {
        state.karyawan.unshift(action.payload);
      },
      prepare(rawData) {
        return { payload: KaryawanModel(rawData) };
      },
    },

    updateKaryawan(state, action) {
      const { id, newData, newStatusData } = action.payload;
      const emp = state.karyawan.find((k) => k.id === id);
      if (!emp) return;

      if (newData.NIP !== undefined) {
        const newNip = String(newData.NIP).trim();
        if (newNip && emp.NIP !== newNip) {
          state.log.push(
            LogChangeModel(newNip, emp.Nama, "nip", emp.NIP, newNip),
          );
        }
      }
      if (newData.Jabatan && emp.Jabatan !== newData.Jabatan.toUpperCase()) {
        state.log.push(
          LogChangeModel(
            emp.NIP,
            emp.Nama,
            "jabatan",
            emp.Jabatan,
            newData.Jabatan,
          ),
        );
      }
      if (newData.SBU !== undefined && emp.SBU !== newData.SBU.toUpperCase()) {
        state.log.push(
          LogChangeModel(
            emp.NIP,
            emp.Nama,
            "sbu",
            emp.SBU,
            newData.SBU.toUpperCase(),
          ),
        );
      }
      if (
        newStatusData &&
        (emp.Status !== newStatusData.Status ||
          emp.StatusCatatan !== newStatusData.Catatan)
      ) {
        state.log.push(
          LogChangeModel(
            emp.NIP,
            emp.Nama,
            "status",
            emp.Status,
            newStatusData.Status,
            newStatusData.Catatan,
          ),
        );
        emp.StatusManual = true;
      }

      Object.assign(
        emp,
        KaryawanModel({ ...emp, ...newData, ...(newStatusData || {}) }),
      );
      emp.TglUpdate = getTodayDate();
    },

    removeKaryawan(state, action) {
      state.karyawan = state.karyawan.filter((k) => k.id !== action.payload);
    },

    bulkUploadKaryawan(state, action) {
      const dataArray = action.payload;
      const existingNIPs = new Set(
        state.karyawan.map((k) => k.NIP).filter(Boolean),
      );
      const seenInFile = new Set();
      const toInsert = dataArray.filter((raw) => {
        const nip = String(raw.NIP || "").trim();
        if (!nip || existingNIPs.has(nip) || seenInFile.has(nip)) return false;
        seenInFile.add(nip);
        return true;
      });

      const defaultPJTK =
        getMostCommonValue(state.karyawan, "PJTK") || CONFIG.DEFAULT_PJTK;
      const defaultNoSP2K =
        getMostCommonValue(state.karyawan, "NoSP2K") || CONFIG.DEFAULT_NO_SP2K;
      const newEmployees = toInsert.map((data) => {
        if (!String(data.PJTK || "").trim()) data.PJTK = defaultPJTK;
        if (!String(data.NoSP2K || "").trim()) data.NoSP2K = defaultNoSP2K;
        return KaryawanModel(data);
      });
      state.karyawan = state.karyawan.concat(newEmployees);

      const slotConfigSudahAda = Object.keys(state.slotConfig || {}).length > 0;
      if (!slotConfigSudahAda && newEmployees.length > 0) {
        const config = {};
        newEmployees.forEach((emp) => {
          if (!emp.SBU || !emp.Jabatan) return;
          if (!config[emp.SBU]) config[emp.SBU] = { total: 0, jabatan: {} };
          config[emp.SBU].jabatan[emp.Jabatan] =
            (config[emp.SBU].jabatan[emp.Jabatan] || 0) + 1;
        });
        Object.values(config).forEach((d) => {
          d.total = Object.values(d.jabatan).reduce((s, v) => s + v, 0);
        });
        state.slotConfig = config;
      }

      if (dataArray.length > 0) {
        state.log.push(
          LogChangeModel(
            "SYSTEM",
            "SYSTEM",
            "upload",
            `${dataArray.length} baris diproses`,
            `${newEmployees.length} baru ditambahkan`,
          ),
        );
      }
    },

    autoUpdateNewEmployeeStatus(state) {
      state.karyawan.forEach((emp) => {
        if (emp.Status !== "Baru Masuk" || !emp.TglMasuk) return;
        const months = monthsSince(emp.TglMasuk);
        if (months !== null && months >= 1) {
          state.log.push(
            LogChangeModel(
              emp.NIP,
              emp.Nama,
              "status",
              "Baru Masuk",
              "Aktif",
              "Otomatis diubah sistem — sudah genap 1 bulan",
            ),
          );
          emp.Status = "Aktif";
          emp.TglUpdate = getTodayDate();
        }
      });
    },

    // ── Lembur ────────────────────────────────────────────
    addLembur: {
      reducer(state, action) {
        state.lembur.push(action.payload);
      },
      prepare(rawData) {
        return { payload: LemburModel(rawData) };
      },
    },

    bulkUploadLembur(state, action) {
      const rows = action.payload.filter((r) => r.NIP && r.Nominal && r.Bulan);
      const newRows = rows.map((r) => {
        const emp = findKaryawanByNIP(state.karyawan, r.NIP);
        return LemburModel({
          ...r,
          Nama: emp?.Nama,
          SBU: emp?.SBU,
          Jabatan: emp?.Jabatan,
        });
      });
      state.lembur = state.lembur.concat(newRows);
    },

    removeLembur(state, action) {
      state.lembur = state.lembur.filter((l) => l.id !== action.payload);
    },

    updateLembur(state, action) {
      const { id, newData } = action.payload;
      const item = state.lembur.find((l) => l.id === id);
      if (item) Object.assign(item, newData);
    },

    // ── Laptop ────────────────────────────────────────────
    addLaptop: {
      reducer(state, action) {
        state.laptop.push(action.payload);
      },
      prepare(rawData) {
        return { payload: LaptopModel(rawData) };
      },
    },

    bulkUploadLaptop(state, action) {
      const excluded = CONFIG.JABATAN_LAPTOP_EXCLUDED || [];
      const seenSerial = new Set();
      const existingSerial = new Set(
        state.laptop
          .filter((l) => !isLaptopSerialReleased(state.karyawan, l))
          .map((l) =>
            String(l.SerialNumber || "")
              .trim()
              .toLowerCase(),
          ),
      );
      const newRows = [];
      action.payload.forEach((raw) => {
        const serialKey = String(raw.SerialNumber || "")
          .trim()
          .toLowerCase();
        const emp = raw.NIP ? findKaryawanByNIP(state.karyawan, raw.NIP) : null;
        const valid =
          (raw.NIP || raw.NamaPengguna) &&
          raw.NamaPerangkat &&
          serialKey &&
          !(emp && excluded.includes(emp.Jabatan)) &&
          !existingSerial.has(serialKey) &&
          !seenSerial.has(serialKey);
        if (!valid) return;
        seenSerial.add(serialKey);
        newRows.push(
          LaptopModel({
            ...raw,
            NamaPengguna: emp ? emp.Nama : raw.NamaPengguna,
            SBU: emp ? emp.SBU : raw.SBU,
          }),
        );
      });
      state.laptop = state.laptop.concat(newRows);
    },

    removeLaptop(state, action) {
      state.laptop = state.laptop.filter((l) => l.id !== action.payload);
    },

    updateLaptop(state, action) {
      const { id, newData } = action.payload;
      const item = state.laptop.find((l) => l.id === id);
      if (item) Object.assign(item, newData);
    },

    //--Jabatan---------------------------------
    addJabatan(state, action) {
      const nama = action.payload.trim().toUpperCase();
      if (!state.jabatan.find((j) => j.nama === nama))
        state.jabatan.push({ nama });
    },
    removeJabatan(state, action) {
      state.jabatan = state.jabatan.filter((j) => j.nama !== action.payload);
    },
    addSubBidang(state, action) {
      const nama = action.payload.trim().toUpperCase();
      if (!state.subBidang.find((s) => s.nama === nama))
        state.subBidang.push({ nama });
    },
    removeSubBidang(state, action) {
      state.subBidang = state.subBidang.filter(
        (s) => s.nama !== action.payload,
      );
    },

    updateSlotConfig(state, action) {
      const { sbu, jabatanMap } = action.payload; // jabatanMap: { [jabatan]: jumlah }
      const total = Object.values(jabatanMap).reduce(
        (s, v) => s + (Number(v) || 0),
        0,
      );
      state.slotConfig[sbu] = { total, jabatan: jabatanMap };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchState.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchState.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.status = "succeeded";
      })
      .addCase(fetchState.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const {
  setSubBidang,
  repairDuplicateIds,
  addKaryawan,
  updateKaryawan,
  removeKaryawan,
  bulkUploadKaryawan,
  autoUpdateNewEmployeeStatus,
  addLembur,
  bulkUploadLembur,
  removeLembur,
  updateLembur,
  addLaptop,
  bulkUploadLaptop,
  removeLaptop,
  updateLaptop,
  addJabatan,
  removeJabatan,
  addSubBidang,
  removeSubBidang,
  updateSlotConfig,
} = hrisSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────

const selectLembur = (state) => state.hris.lembur;

export const selectLemburTahunMap = createSelector([selectLembur], (lembur) => {
  const map = {};
  for (const item of lembur) {
    const [bulan, tahun] = (item.Bulan || "").split(" ");
    if (!tahun) continue;
    if (!map[tahun]) map[tahun] = new Set();
    map[tahun].add(bulan);
  }
  return map;
});

export const selectLemburTahunList = createSelector(
  [selectLemburTahunMap],
  (tahunMap) => {
    const currentYear = new Date().getFullYear();
    const fallback = [String(currentYear), String(currentYear + 1)];
    const all = new Set([...Object.keys(tahunMap), ...fallback]);
    return [...all].sort();
  },
);

export const selectChangesCount = (state) => state.hris.log?.length ?? 0;

export default hrisSlice.reducer;

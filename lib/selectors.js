import { CONFIG } from './config';

export function findKaryawanByNIP(karyawan, nip) {
  return karyawan.find((k) => k.NIP === nip) || null;
}

export function slotSBUTotal(slotConfig, sbu) {
  const detail = slotConfig[sbu];
  if (!detail || !detail.jabatan) return 0;
  return Object.values(detail.jabatan).reduce((sum, v) => sum + (Number(v) || 0), 0);
}

export function getTotalSlotFix(slotConfig) {
  return Object.keys(slotConfig).reduce((sum, sbu) => sum + slotSBUTotal(slotConfig, sbu), 0);
}

export function getMostCommonValue(karyawan, field) {
  const counts = {};
  karyawan.forEach((k) => {
    const v = String(k[field] || '').trim();
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  let best = '', bestCount = 0;
  Object.keys(counts).forEach((v) => { if (counts[v] > bestCount) { best = v; bestCount = counts[v]; } });
  return best;
}

export function isLaptopSerialReleased(karyawan, row) {
  if (!row) return false;
  if (row.Status !== 'Sudah Dikembalikan') return false;
  const emp = findKaryawanByNIP(karyawan, row.NIP);
  if (!emp) return true;
  return emp.Status === 'Resign';
}

export function suggestStatusLaptop(karyawan, nip, hasBukti) {
  const emp = findKaryawanByNIP(karyawan, nip);
  const isResign = emp && emp.Status === 'Resign';
  if (isResign) return hasBukti ? 'Sudah Dikembalikan' : 'Belum Dikembalikan';
  return 'Aktif';
}

export function getLaptopRowsWithMissing(karyawan, laptop) {
  const excluded = CONFIG.JABATAN_LAPTOP_EXCLUDED || [];
  const real = laptop.map((l) => ({ ...l, Jabatan: (findKaryawanByNIP(karyawan, l.NIP) || {}).Jabatan || '' }));
  const nipWithLaptop = new Set(laptop.map((l) => l.NIP).filter(Boolean));
  const missing = karyawan
    .filter((k) => k.Status !== 'Resign' && k.NIP && !nipWithLaptop.has(k.NIP))
    .map((k) => ({
      id: 'missing-' + k.id,
      NIP: k.NIP, NamaPerangkat: '', PA: '', NamaPengguna: k.Nama, SerialNumber: '',
      SBU: k.SBU, Jabatan: k.Jabatan,
      Status: excluded.includes(k.Jabatan) ? 'Tidak Dapat Laptop' : 'Belum Dapat Laptop',
      BuktiBA: null, BuktiBAFileName: null, __virtual: true,
    }));
  return real.concat(missing);
}

// Susun histori perpindahan jabatan dari log perubahan
export function getJabatanHistory(log, emp) {
  const logs = log
    .filter((c) => c.type === 'jabatan' && c.nik === emp.NIP)
    .slice()
    .sort((a, b) => (a.ts === b.ts ? a.id - b.id : a.ts.localeCompare(b.ts)));

  if (!logs.length) {
    return [{ jabatan: emp.Jabatan || '—', mulai: emp.TglMasuk || null, selesai: null, current: true }];
  }

  const history = [];
  const startDate = emp.TglMasuk || logs[0].ts;
  history.push({ jabatan: logs[0].oldVal, mulai: startDate, selesai: logs[0].ts, current: false });
  logs.forEach((c, i) => {
    const isLast = i === logs.length - 1;
    history.push({ jabatan: c.newVal, mulai: c.ts, selesai: isLast ? null : logs[i + 1].ts, current: isLast });
  });
  return history;
}
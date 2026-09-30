// app/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchState, selectChangesCount } from "@/store/slices/hrisSlice";
import TipeKaryawanChart from "@/components/dashboard/TipeKaryawanChart";
import SlotPerSbuTable from "@/components/dashboard/SlotPerSBUTable";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { karyawan, jabatan, log, slotConfig, status } = useSelector(
    (s) => s.hris,
  );
  const changesCount = useSelector(selectChangesCount);

  const [searchLog, setSearchLog] = useState("");
  const [filterLogType, setFilterLogType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(10);

  useEffect(() => {
    if (status === "idle") dispatch(fetchState());
  }, [status, dispatch]);

  // ── Statistik kartu ──────────────────────────────────────
  const stats = useMemo(() => {
    const baru = karyawan.filter((k) => k.status === "Baru Masuk").length;
    const aktif = karyawan.filter((k) => k.status === "Aktif").length;
    const resign = karyawan.filter((k) => k.status === "Resign").length;

    // Asumsi: slotConfig berbentuk { [namaJabatan]: jumlahSlotFix }
    const slotTotal = Object.values(slotConfig || {}).reduce(
      (a, b) => a + Number(b || 0),
      0,
    );
    const slotTerisi = karyawan.filter((k) => k.status !== "Resign").length;
    const slotSisa = Math.max(slotTotal - slotTerisi, 0);

    return {
      baru,
      aktif,
      resign,
      changed: changesCount,
      types: jabatan.length,
      slotTotal,
      slotTerisi,
      slotSisa,
    };
  }, [karyawan, jabatan, slotConfig, changesCount]);

  // ── Filter & pagination log ──────────────────────────────
  const logTypes = useMemo(
    () => [...new Set(log.map((l) => l.tipe).filter(Boolean))],
    [log],
  );

  const filteredLog = useMemo(() => {
    return log.filter((item) => {
      if (filterLogType && item.tipe !== filterLogType) return false;
      if (dateFrom && new Date(item.tanggal) < new Date(dateFrom)) return false;
      if (dateTo && new Date(item.tanggal) > new Date(dateTo)) return false;
      if (searchLog) {
        const q = searchLog.toLowerCase();
        const match =
          item.nip?.toLowerCase().includes(q) ||
          item.nama?.toLowerCase().includes(q) ||
          item.tipe?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [log, filterLogType, dateFrom, dateTo, searchLog]);

  const totalLogPages = Math.max(
    Math.ceil(filteredLog.length / logPageSize),
    1,
  );
  const pagedLog = filteredLog.slice(
    (logPage - 1) * logPageSize,
    logPage * logPageSize,
  );

  const resetLogPage = () => setLogPage(1);

  if (status === "loading" || status === "idle") {
    return <DashboardSkeleton />;
  }

  return (
    <div className="page active">
      <div className="page-header">
        <h1>Dashboard Karyawan</h1>
        <p>Ringkasan data karyawan, status, dan perubahan historis.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">🟢 Karyawan Baru</div>
          <div className="stat-value success">{stats.baru}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">🔵 Aktif</div>
          <div className="stat-value accent">{stats.aktif}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">🔴 Resign</div>
          <div className="stat-value danger">{stats.resign}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Data Diubah</div>
          <div className="stat-value warning">{stats.changed}</div>
        </div>
      </div>

      <div className="stat-grid cols-4">
        <div className="stat-card">
          <div className="stat-label">📋 Total Jabatan Tersedia</div>
          <div className="stat-value">{stats.types}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📌 Total Slot Fix</div>
          <div className="stat-value purple">{stats.slotTotal}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">✅ Slot Terisi</div>
          <div className="stat-value accent">{stats.slotTerisi}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">🟡 Slot Tersisa</div>
          <div className="stat-value warning">{stats.slotSisa}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📊 Tipe Karyawan — Bulan Berjalan</div>
        <TipeKaryawanChart karyawan={karyawan} />
      </div>

      <div className="card">
        <div className="card-title">
          📌 Slot Jabatan per SBU (Fix: {stats.slotTotal} Total)
        </div>
        <SlotPerSbuTable karyawan={karyawan} slotConfig={slotConfig} />
      </div>

      <div className="card">
        <div
          className="flex-between"
          style={{
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div className="card-title" style={{ margin: 0 }}>
            🔄 Review Log Perubahan
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <select
              className="form-control"
              style={{ maxWidth: 180 }}
              value={filterLogType}
              onChange={(e) => {
                setFilterLogType(e.target.value);
                resetLogPage();
              }}
            >
              <option value="">Semua Tipe</option>
              {logTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="form-control"
              style={{ maxWidth: 150 }}
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                resetLogPage();
              }}
            />
            <span style={{ color: "var(--text2)", fontSize: 12 }}>s/d</span>
            <input
              type="date"
              className="form-control"
              style={{ maxWidth: 150 }}
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                resetLogPage();
              }}
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                resetLogPage();
              }}
            >
              ✕
            </button>
            <input
              type="text"
              placeholder="🔍 Cari log (NIP, Nama, Tipe)..."
              className="form-control"
              style={{ maxWidth: 250 }}
              value={searchLog}
              onChange={(e) => {
                setSearchLog(e.target.value);
                resetLogPage();
              }}
            />
          </div>
        </div>

        {pagedLog.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <h3>Belum ada perubahan</h3>
            <p>Log akan muncul saat ada perubahan data karyawan.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Tipe</th>
                  <th>NIP</th>
                  <th>Nama</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {pagedLog.map((item, i) => (
                  <tr key={i}>
                    <td>{item.tanggal}</td>
                    <td>{item.tipe}</td>
                    <td>{item.nip}</td>
                    <td>{item.nama}</td>
                    <td>{item.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredLog.length > 0 && (
          <div className="pagination-container">
            <div className="page-info">
              Menampilkan
              <select
                value={logPageSize}
                onChange={(e) => {
                  setLogPageSize(Number(e.target.value));
                  resetLogPage();
                }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              log per halaman. Total:{" "}
              <span style={{ fontWeight: 600 }}>{filteredLog.length}</span> log.
            </div>
            <div className="page-controls">
              <button
                disabled={logPage === 1}
                onClick={() => setLogPage((p) => p - 1)}
              >
                ‹
              </button>
              <span>
                {logPage} / {totalLogPages}
              </span>
              <button
                disabled={logPage === totalLogPages}
                onClick={() => setLogPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-end">
        <button
          className="btn btn-success"
          onClick={() =>
            import("@/lib/excel").then((m) => m.exportKaryawanExcel(karyawan))
          }
        >
          ⬇ Export Excel Terbaru
        </button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="stat-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="stat-card" key={i}>
            <div className="skeleton skeleton-text" style={{ width: "70%" }} />
            <div className="skeleton skeleton-value" />
          </div>
        ))}
      </div>
      <div className="card">
        <div
          className="skeleton skeleton-text"
          style={{ width: 220, height: 14, marginBottom: 16 }}
        />
        <div className="skeleton skeleton-block" style={{ height: 180 }} />
      </div>
    </div>
  );
}

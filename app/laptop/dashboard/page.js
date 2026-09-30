'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getLaptopRowsWithMissing } from '@/lib/selectors';

export default function Page() {
  const karyawan = useSelector((s) => s.hris.karyawan);
  const laptop = useSelector((s) => s.hris.laptop);
  const rows = useMemo(() => getLaptopRowsWithMissing(karyawan, laptop), [karyawan, laptop]);

  const stats = useMemo(() => ({
    aktif: rows.filter((r) => r.Status === 'Aktif').length,
    belumKembali: rows.filter((r) => r.Status === 'Belum Dikembalikan').length,
    sudahKembali: rows.filter((r) => r.Status === 'Sudah Dikembalikan').length,
    belumDapat: rows.filter((r) => r.Status === 'Belum Dapat Laptop').length,
  }), [rows]);

  return (
    <div className="page active">
      <div className="page-header"><h1>💻 Dashboard Laptop</h1></div>
      <div className="stat-grid cols-4">
        <div className="stat-card"><div className="stat-label">Aktif</div><div className="stat-value accent">{stats.aktif}</div></div>
        <div className="stat-card"><div className="stat-label">Belum Dikembalikan</div><div className="stat-value warning">{stats.belumKembali}</div></div>
        <div className="stat-card"><div className="stat-label">Sudah Dikembalikan</div><div className="stat-value success">{stats.sudahKembali}</div></div>
        <div className="stat-card"><div className="stat-label">Belum Dapat Laptop</div><div className="stat-value danger">{stats.belumDapat}</div></div>
      </div>
    </div>
  );
}
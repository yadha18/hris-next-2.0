// components/layout/Sidebar.jsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function LemburYearGroup({ tahun, bulanSet }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="nav-item"
        style={{ justifyContent: 'space-between' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span><span className="icon">📅</span> {tahun}</span>
        <span style={{ fontSize: 11 }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div>
          {BULAN.map((bulan) => (
            <Link
              key={bulan}
              href={`/lembur/${tahun}/${bulan.toLowerCase()}`}
              className="nav-item nav-sub"
            >
              {bulan}
              {bulanSet.has(bulan) && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent)' }}>●</span>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const lembur = useSelector((state) => state.hris.lembur);
  const changesCount = useSelector((state) => state.hris.log?.length ?? 0);

  // Kelompokkan data lembur per tahun -> set nama bulan yang punya data
  const tahunMap = useMemo(() => {
    const map = {};
    for (const item of lembur) {
      const [bulan, tahun] = (item.bulan || '').split(' '); // format: "Januari 2026"
      if (!tahun) continue;
      if (!map[tahun]) map[tahun] = new Set();
      map[tahun].add(bulan);
    }
    return map;
  }, [lembur]);

  const tahunList = useMemo(() => {
    const tahunFromData = Object.keys(tahunMap);
    const currentYear = new Date().getFullYear();
    const fallback = [String(currentYear), String(currentYear + 1)];
    const all = new Set([...tahunFromData, ...fallback]);
    return [...all].sort();
  }, [tahunMap]);

  const isActive = (href) => pathname === href;

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <nav className={`sidebar ${open ? 'open' : ''}`}>
        <div className="nav-label">Menu</div>
        <Link href="/upload" className="nav-item">📂 Upload Data</Link>

        <div className="nav-label">
          Data Informasi Karyawan
          {changesCount > 0 && <span className="badge-count" style={{ marginLeft: 6 }}>{changesCount} perubahan</span>}
        </div>
        <Link href="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>📊 Dashboard Karyawan</Link>
        <Link href="/karyawan" className="nav-item">👥 Tabel Data Karyawan</Link>

        <div className="nav-label">Data Lembur dan SPPD Karyawan</div>
        {tahunList.map((tahun) => (
          <LemburYearGroup key={tahun} tahun={tahun} bulanSet={tahunMap[tahun] || new Set()} />
        ))}

        <div className="nav-label">Monitoring Pengadaan Laptop</div>
        <Link href="/laptop/dashboard" className="nav-item">💻 Dashboard Laptop</Link>
        <Link href="/laptop" className="nav-item">🧾 Tabel Monitoring Laptop</Link>

        <div className="nav-label">Pengaturan</div>
        <Link href="/jabatan" className="nav-item">📋 Daftar Jabatan</Link>
        <Link href="/sbu-grade" className="nav-item">📐 Kombinasi SBU & Grade</Link>
      </nav>
    </>
  );
}
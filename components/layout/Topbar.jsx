'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectChangesCount } from '@/store/slices/hrisSlice';

export default function Topbar({ onToggleSidebar }) {
  const changesCount = useSelector(selectChangesCount);
  const [theme, setTheme] = useState('dark');

  // Baca tema yang sudah di-set oleh inline script di layout.js (hindari flash)
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('hris_theme', next); } catch (e) {}
    setTheme(next);
  };

  return (
    <div className="topbar">
      <button className="hamburger-btn" onClick={onToggleSidebar} title="Menu" aria-label="Buka/tutup menu">
        <span></span><span></span><span></span>
      </button>
      <div className="topbar-logo">HRIS <span>/ Jabatan Karyawan</span></div>
      <div className="topbar-sep"></div>
      {changesCount > 0 && <span className="badge-count">{changesCount} perubahan</span>}
      <button className="theme-switch" onClick={toggleTheme} title="Ganti Light/Dark Mode" aria-label="Toggle Light/Dark Mode">
        <span className="theme-switch-icon">🌙</span>
        <span className="theme-switch-icon">☀️</span>
        <span className="theme-switch-thumb"></span>
      </button>
    </div>
  );
}
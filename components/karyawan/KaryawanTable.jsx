'use client';

import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeKaryawan, saveState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';
import { sortGradeList, formatRupiah } from '@/lib/utils';
import EditKaryawanModal from './EditKaryawanModal';
import ConfirmHapusSemuaModal from '../ui/ConfirmHapusSemuaModal';

const STATUS_META = {
  'Baru Masuk': { pill: 'pill-green', label: '🟢 Baru Masuk' },
  'Aktif': { pill: 'pill-blue', label: '🔵 Aktif' },
  'Resign': { pill: 'pill-red', label: '🔴 Resign' },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function KaryawanTable() {
  const dispatch = useDispatch();
  const karyawan = useSelector((s) => s.hris.karyawan);

  const [search, setSearch] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [filterSBU, setFilterSBU] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editId, setEditId] = useState(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showHapusSemua, setShowHapusSemua] = useState(false);

  const jabatanOptions = useMemo(() => [...new Set(karyawan.map((k) => k.Jabatan))].filter(Boolean), [karyawan]);
  const sbuOptions = useMemo(() => [...new Set(karyawan.map((k) => k.SBU))].filter(Boolean), [karyawan]);
  const gradeOptions = useMemo(() => sortGradeList([...new Set(karyawan.map((k) => k.Grade))].filter(Boolean)), [karyawan]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return karyawan.filter((k) =>
      (!q || k.NIP.toLowerCase().includes(q) || k.Nama.toLowerCase().includes(q) || k.SBU.toLowerCase().includes(q)) &&
      (!filterJabatan || k.Jabatan === filterJabatan) &&
      (!filterSBU || k.SBU === filterSBU) &&
      (!filterStatus || k.Status === filterStatus) &&
      (!filterGrade || k.Grade === filterGrade)
    );
  }, [karyawan, search, filterJabatan, filterSBU, filterStatus, filterGrade]);

  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetPage = () => setPage(1);

  const handleDelete = () => {
    dispatch(removeKaryawan(confirmDeleteId));
    dispatch(saveState());
    dispatch(showToast('🗑 Karyawan dihapus'));
    setConfirmDeleteId(null);
  };

  const handleHapusSemua = () => {
    karyawan.forEach((k) => dispatch(removeKaryawan(k.id)));
    dispatch(saveState());
    dispatch(showToast('🗑 Semua data karyawan dihapus'));
    setShowHapusSemua(false);
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>Tabel Data Karyawan</h1>
            <p>Semua data detail karyawan. Anda dapat mengedit seluruh data & status secara manual.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-danger" onClick={() => setShowHapusSemua(true)}>🗑 Hapus Semua</button>
            <button className="btn btn-primary" onClick={() => setEditId(null)}>➕ Tambah Karyawan Manual</button>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <input placeholder="🔍  Cari NIP, Nama, SBU..." value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} />
        <select value={filterJabatan} onChange={(e) => { setFilterJabatan(e.target.value); resetPage(); }}>
          <option value="">Semua Jabatan</option>
          {jabatanOptions.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
        <select value={filterSBU} onChange={(e) => { setFilterSBU(e.target.value); resetPage(); }}>
          <option value="">Semua SBU</option>
          {sbuOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterGrade} onChange={(e) => { setFilterGrade(e.target.value); resetPage(); }}>
          <option value="">Semua Grade</option>
          {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}>
          <option value="">Semua Status</option>
          <option value="Baru Masuk">Baru Masuk</option>
          <option value="Aktif">Aktif</option>
          <option value="Resign">Resign</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">👥</div><h3>Tidak ada data</h3></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aksi</th><th>NIP</th><th>Nama</th><th>NIK</th><th>Grade</th><th>Jabatan</th><th>SBU</th>
                <th>Gaji Pokok</th><th>Harga Satuan</th><th>SubBidang</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((k) => (
                <tr key={k.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(k.id)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" style={{ marginLeft: 4 }} onClick={() => setConfirmDeleteId(k.id)}>🗑 Hapus</button>
                  </td>
                  <td className="mono">{k.NIP}</td>
                  <td style={{ fontWeight: 500 }}>{k.Nama}</td>
                  <td className="mono">{k.NIK || '—'}</td>
                  <td>{k.Grade ? <span className="pill pill-purple">{k.Grade}</span> : '—'}</td>
                  <td><span className="pill pill-blue">{k.Jabatan}</span></td>
                  <td>{k.SBU}</td>
                  <td className="mono">{formatRupiah(k.GajiPokok)}</td>
                  <td className="mono">{formatRupiah(k.HargaSatuan)}</td>
                  <td>{k.SubBidang ? <span className="pill pill-gray">{k.SubBidang}</span> : '—'}</td>
                  <td>
                    <span className={`pill ${(STATUS_META[k.Status] || {}).pill || 'pill-gray'}`}>
                      {(STATUS_META[k.Status] || {}).label || k.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="pagination-container">
          <div className="page-info">
            Menampilkan
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}>
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            data per halaman. Total: <span style={{ fontWeight: 600 }}>{filtered.length}</span> data.
          </div>
          <div className="page-controls">
            <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>❮</button>
            <span>{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>❯</button>
          </div>
        </div>
      )}

      {editId !== undefined && <EditKaryawanModal id={editId} onClose={() => setEditId(undefined)} />}

      {confirmDeleteId !== null && (
        <div className="modal-overlay open">
          <div className="modal" style={{ width: 400 }}>
            <div className="modal-header"><h2>Hapus Karyawan?</h2></div>
            <p>Data karyawan ini akan dihapus permanen.</p>
            <div className="flex-end" style={{ marginTop: 15 }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showHapusSemua && (
        <ConfirmHapusSemuaModal
          title="Hapus Semua Data Karyawan"
          countLabel="Total Data Karyawan"
          count={karyawan.length}
          onClose={() => setShowHapusSemua(false)}
          onConfirm={handleHapusSemua}
        />
      )}
    </div>
  );
}
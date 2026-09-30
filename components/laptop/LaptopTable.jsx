'use client';

import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeLaptop, saveState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';
import { getLaptopRowsWithMissing } from '@/lib/selectors';
import ConfirmHapusSemuaModal from '../ui/ConfirmHapusSemuaModal';
import EditLaptopModal from './EditLaptopModal';

export default function LaptopTable() {
  const dispatch = useDispatch();
  const karyawan = useSelector((s) => s.hris.karyawan);
  const laptop = useSelector((s) => s.hris.laptop);
  const [search, setSearch] = useState('');
  const [editState, setEditState] = useState(undefined); // { id, prefillNIP }
  const [showHapusSemua, setShowHapusSemua] = useState(false);

  const rows = useMemo(() => getLaptopRowsWithMissing(karyawan, laptop), [karyawan, laptop]);
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.NIP?.toLowerCase().includes(q) || r.NamaPengguna?.toLowerCase().includes(q) || r.SerialNumber?.toLowerCase().includes(q);
  });

  const handleDelete = (id) => {
    dispatch(removeLaptop(id));
    dispatch(saveState());
    dispatch(showToast('🗑 Data laptop dihapus'));
  };

  return (
    <div className="page active">
      <div className="page-header">
        <h1>🧾 Tabel Monitoring Pengadaan Laptop</h1>
        <p>Klik "Tambah" pada baris "Belum Dapat Laptop" untuk isi data langsung.</p>
      </div>
      <div className="flex-end" style={{ marginBottom: 12, gap: 10 }}>
        <button className="btn btn-danger" onClick={() => setShowHapusSemua(true)}>🗑 Hapus Semua</button>
        <button className="btn btn-primary" onClick={() => setEditState({ id: null })}>➕ Tambah Data</button>
      </div>
      <div className="search-bar">
        <input placeholder="🔍 Cari NIP, Nama, Serial..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Aksi</th><th>NIP</th><th>Nama Pengguna</th><th>Perangkat</th><th>SN</th><th>SBU</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td>
                  {l.__virtual
                    ? <button className="btn btn-primary btn-sm" onClick={() => setEditState({ id: null, prefillNIP: l.NIP })}>➕ Tambah</button>
                    : <>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditState({ id: l.id })}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>🗑</button>
                      </>}
                </td>
                <td className="mono">{l.NIP || '—'}</td>
                <td>{l.NamaPengguna}</td>
                <td>{l.NamaPerangkat || '—'}</td>
                <td className="mono">{l.SerialNumber || '—'}</td>
                <td>{l.SBU}</td>
                <td><span className="pill pill-gray">{l.Status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editState !== undefined && (
        <EditLaptopModal id={editState.id} prefillNIP={editState.prefillNIP} onClose={() => setEditState(undefined)} />
      )}
      {showHapusSemua && (
        <ConfirmHapusSemuaModal
          title="Hapus Semua Data Laptop" countLabel="Total Data Laptop" count={laptop.length}
          onClose={() => setShowHapusSemua(false)}
          onConfirm={() => {
            laptop.forEach((l) => dispatch(removeLaptop(l.id)));
            dispatch(saveState());
            setShowHapusSemua(false);
          }}
        />
      )}
    </div>
  );
}
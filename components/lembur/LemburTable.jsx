'use client';

import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeLembur, saveState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';
import { formatRupiah } from '@/lib/utils';
import EditLemburModal from './EditLemburModal';
import ConfirmHapusSemuaModal from '../ui/ConfirmHapusSemuaModal';

export default function LemburTable({ bulanTahun }) {
  const dispatch = useDispatch();
  const lembur = useSelector((s) => s.hris.lembur);
  const [editState, setEditState] = useState(undefined);
  const [showHapusSemua, setShowHapusSemua] = useState(false);

  const rows = useMemo(() => lembur.filter((l) => l.Bulan === bulanTahun), [lembur, bulanTahun]);
  const total = rows.reduce((s, r) => s + Number(r.Nominal), 0);

  const handleDelete = (id) => {
    dispatch(removeLembur(id));
    dispatch(saveState());
    dispatch(showToast('🗑 Data lembur dihapus'));
  };

  return (
    <div className="page active">
      <div className="page-header"><h1>🧾 Lembur & SPPD — {bulanTahun}</h1></div>

      <div className="stat-grid cols-2" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-label">Total Baris</div><div className="stat-value">{rows.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Nominal</div><div className="stat-value accent">{formatRupiah(total)}</div></div>
      </div>

      <div className="flex-end" style={{ marginBottom: 12, gap: 10 }}>
        <button className="btn btn-danger" onClick={() => setShowHapusSemua(true)}>🗑 Hapus Semua Bulan Ini</button>
        <button className="btn btn-primary" onClick={() => setEditState({ id: null })}>➕ Tambah Data</button>
      </div>

      {rows.length === 0 ? (
        <div className="empty"><div className="empty-icon">🧾</div><h3>Belum ada data bulan ini</h3></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Aksi</th><th>NIP</th><th>Nama</th><th>SBU</th><th>Jabatan</th><th>Nominal</th><th>Tagihan</th></tr></thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditState({ id: l.id })}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>🗑</button>
                  </td>
                  <td className="mono">{l.NIP}</td>
                  <td>{l.Nama}</td>
                  <td>{l.SBU}</td>
                  <td><span className="pill pill-blue">{l.Jabatan}</span></td>
                  <td className="mono">{formatRupiah(l.Nominal)}</td>
                  <td>{l.Tagihan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editState !== undefined && (
        <EditLemburModal id={editState.id} defaultBulan={bulanTahun} onClose={() => setEditState(undefined)} />
      )}
      {showHapusSemua && (
        <ConfirmHapusSemuaModal
          title={`Hapus Semua Lembur ${bulanTahun}`} countLabel="Total Data" count={rows.length}
          onClose={() => setShowHapusSemua(false)}
          onConfirm={() => {
            rows.forEach((r) => dispatch(removeLembur(r.id)));
            dispatch(saveState());
            setShowHapusSemua(false);
          }}
        />
      )}
    </div>
  );
}
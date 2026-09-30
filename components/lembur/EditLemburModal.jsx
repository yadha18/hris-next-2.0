'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLembur, updateLembur, saveState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';
import { CONFIG } from '@/lib/config';
import { findKaryawanByNIP } from '@/lib/selectors';
import { parseNominal } from '@/lib/utils';

export default function EditLemburModal({ id, defaultBulan, onClose }) {
  const dispatch = useDispatch();
  const karyawan = useSelector((s) => s.hris.karyawan);
  const lembur = useSelector((s) => s.hris.lembur);
  const existing = id ? lembur.find((l) => l.id === id) : null;

  const [nip, setNip] = useState(existing?.NIP || '');
  const [nominal, setNominal] = useState(existing?.Nominal || '');
  const [bulan, setBulan] = useState(existing?.Bulan || defaultBulan);
  const [tagihan, setTagihan] = useState(existing?.Tagihan || CONFIG.TAGIHAN_OPTIONS[0]);

  const emp = findKaryawanByNIP(karyawan, nip.trim());
  const fallback = existing?.NIP === nip.trim() ? existing : null;
  const preview = emp || fallback;

  const handleSave = () => {
    if (!nip.trim()) return dispatch(showToast('❌ NIP wajib diisi!'));
    const nom = parseNominal(nominal);
    if (!nom || nom <= 0) return dispatch(showToast('❌ Nominal harus lebih dari 0!'));
    if (!bulan) return dispatch(showToast('❌ Bulan wajib diisi!'));

    const data = {
      NIP: nip.trim(), Nominal: nom, Bulan: bulan, Tagihan: tagihan,
      Nama: preview?.Nama || '', SBU: preview?.SBU || '', Jabatan: preview?.Jabatan || '',
    };

    if (id === null) dispatch(addLembur(data));
    else dispatch(updateLembur({ id, newData: data }));

    dispatch(saveState());
    dispatch(showToast('✅ Data lembur disimpan!'));
    onClose();
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-header">
          <h2>{id === null ? '➕ Tambah Lembur/SPPD' : '✏️ Edit Lembur/SPPD'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-group">
          <label className="form-label">NIP</label>
          <input className="form-control" value={nip} onChange={(e) => setNip(e.target.value)} />
        </div>
        {nip.trim() && !preview && (
          <div className="info-note" style={{ borderColor: 'rgba(239,68,68,.2)', color: 'var(--danger)' }}>
            ⚠️ NIP tidak ditemukan di Data Karyawan.
          </div>
        )}
        {preview && (
          <div className="info-note">👤 {preview.Nama} — {preview.SBU} — {preview.Jabatan}</div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nominal</label>
            <input className="form-control" value={nominal} onChange={(e) => setNominal(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Bulan</label>
            <input className="form-control" value={bulan} onChange={(e) => setBulan(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Tagihan</label>
          <select className="form-control" value={tagihan} onChange={(e) => setTagihan(e.target.value)}>
            {CONFIG.TAGIHAN_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-end" style={{ marginTop: 15 }}>
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
        </div>
      </div>
    </div>
  );
}
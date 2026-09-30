'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLaptop, updateLaptop, saveState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';
import { CONFIG } from '@/lib/config';
import { findKaryawanByNIP, suggestStatusLaptop } from '@/lib/selectors';
import { compressImageFile } from '@/lib/utils';

const emptyForm = { NIP: '', NamaPengguna: '', SBU: '', NamaPerangkat: '', PA: '', SerialNumber: '', Status: '', BuktiBA: null, BuktiBAFileName: null };

export default function EditLaptopModal({ id, prefillNIP, onClose }) {
  const dispatch = useDispatch();
  const karyawan = useSelector((s) => s.hris.karyawan);
  const laptop = useSelector((s) => s.hris.laptop);
  const existing = id ? laptop.find((l) => l.id === id) : null;
  const [form, setForm] = useState({ ...emptyForm, NIP: prefillNIP || '' });

  useEffect(() => { if (existing) setForm({ ...emptyForm, ...existing }); }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Auto-isi Nama Pengguna & SBU kalau NIP ditemukan
  useEffect(() => {
    const emp = findKaryawanByNIP(karyawan, form.NIP.trim());
    if (emp) setForm((f) => ({ ...f, NamaPengguna: emp.Nama, SBU: emp.SBU }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.NIP]);

  const suggestion = suggestStatusLaptop(karyawan, form.NIP.trim(), !!form.BuktiBA);
  const empFound = !!findKaryawanByNIP(karyawan, form.NIP.trim());

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return dispatch(showToast('❌ File harus berupa gambar!'));
    try {
      const dataUrl = await compressImageFile(file);
      setForm((f) => ({ ...f, BuktiBA: dataUrl, BuktiBAFileName: file.name }));
      dispatch(showToast('✅ Gambar berhasil dimuat'));
    } catch (err) {
      dispatch(showToast('❌ Gagal memproses gambar: ' + err.message));
    }
  };

  const handleSave = () => {
    if (!form.NIP.trim() && !form.NamaPengguna.trim()) return dispatch(showToast('❌ NIP atau Nama Pengguna wajib diisi!'));
    if (!form.NamaPerangkat.trim()) return dispatch(showToast('❌ Nama Perangkat wajib diisi!'));
    if (!form.SerialNumber.trim()) return dispatch(showToast('❌ Serial Number wajib diisi!'));

    if (id === null) dispatch(addLaptop(form));
    else dispatch(updateLaptop({ id, newData: form }));

    dispatch(saveState());
    dispatch(showToast('✅ Data laptop disimpan!'));
    onClose();
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: 560 }}>
        <div className="modal-header">
          <h2>{id === null ? '➕ Tambah Data Laptop' : '✏️ Edit Data Laptop'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">NIP (opsional)</label>
            <input className="form-control" value={form.NIP} onChange={set('NIP')} />
          </div>
          <div className="form-group">
            <label className="form-label">Nama Pengguna</label>
            <input className="form-control" value={form.NamaPengguna} onChange={set('NamaPengguna')} />
          </div>
        </div>
        {form.NIP.trim() && !empFound && (
          <div className="info-note">ℹ️ NIP tidak ditemukan — isi Nama Pengguna & Regional manual.</div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Regional / SBU</label>
            <select className="form-control" value={form.SBU} onChange={set('SBU')}>
              <option value="">— Pilih —</option>
              {CONFIG.DEFAULT_SBU.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">PA</label>
            <input className="form-control" value={form.PA} onChange={set('PA')} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nama Perangkat</label>
            <input className="form-control" value={form.NamaPerangkat} onChange={set('NamaPerangkat')} />
          </div>
          <div className="form-group">
            <label className="form-label">Serial Number</label>
            <input className="form-control" value={form.SerialNumber} onChange={set('SerialNumber')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Status Laptop</label>
          <select className="form-control" value={form.Status} onChange={set('Status')}>
            <option value="">— Belum diisi —</option>
            {CONFIG.STATUS_LAPTOP_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {form.NamaPengguna && <div className="info-note" style={{ marginTop: 8 }}>💡 Saran status: "{suggestion}"</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Bukti Berita Acara (gambar)</label>
          <input type="file" accept="image/*" className="form-control" onChange={handleFile} />
          {form.BuktiBA && <img src={form.BuktiBA} style={{ maxWidth: 160, marginTop: 10, borderRadius: 8 }} />}
        </div>
        <div className="flex-end" style={{ marginTop: 15 }}>
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave}>Simpan Data</button>
        </div>
      </div>
    </div>
  );
}
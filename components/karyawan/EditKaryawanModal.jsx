'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addKaryawan, updateKaryawan, saveState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';
import { CONFIG } from '@/lib/config';
import { sortGradeList, findHargaSbuGrade } from '@/lib/utils';
import { getMostCommonValue } from '@/lib/selectors';

const emptyForm = {
  NIP: '', Nama: '', NIK: '', Grade: '', Jabatan: '', SBU: '',
  PJTK: '', NoSP2K: '', NamaTL: '', SubBidang: '',
  BKOJabatan: '', BKOSBU: '', NIPBaru: '', Email: '', EmailKorporat: '',
  NamaAkunICRM: '', TglMasuk: '', TglKeluar: '', UkuranBaju: '', NoTelp: '+62',
  Status: 'Baru Masuk', StatusCatatan: '',
};

export default function EditKaryawanModal({ id, onClose }) {
  const dispatch = useDispatch();
  const karyawan = useSelector((s) => s.hris.karyawan);
  const jabatanList = useSelector((s) => s.hris.jabatan);
  const subBidangList = useSelector((s) => s.hris.subBidang);

  const existing = id ? karyawan.find((k) => k.id === id) : null;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (existing) {
      setForm({ ...emptyForm, ...existing });
    } else {
      setForm({
        ...emptyForm,
        PJTK: getMostCommonValue(karyawan, 'PJTK') || CONFIG.DEFAULT_PJTK,
        NoSP2K: getMostCommonValue(karyawan, 'NoSP2K') || CONFIG.DEFAULT_NO_SP2K,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const setBKOJabatan = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, BKOJabatan: val, Jabatan: val || f.Jabatan }));
  };

  const gradeOptions = sortGradeList(CONFIG.DEFAULT_GRADE);
  const gradeOptionsWithLegacy = form.Grade && !gradeOptions.includes(form.Grade)
    ? [...gradeOptions, form.Grade]
    : gradeOptions;

  const handleSave = () => {
    if (!form.NIP.trim() || !form.Nama.trim()) {
      dispatch(showToast('❌ NIP dan Nama wajib diisi!'));
      return;
    }

    const nipTaken = karyawan.some((k) => k.NIP === form.NIP.trim() && k.id !== id);
    if (nipTaken) {
      dispatch(showToast(`❌ NIP "${form.NIP}" sudah dipakai karyawan lain!`, 4000));
      return;
    }

    const BKOJabatanValue = form.BKOJabatan.toUpperCase();
    const JabatanValue = BKOJabatanValue || form.Jabatan;
    const harga = findHargaSbuGrade(form.SBU, form.Grade);

    const formData = {
      ...form,
      Jabatan: JabatanValue,
      BKOJabatan: BKOJabatanValue,
      BKOSBU: form.BKOSBU.toUpperCase(),
      GajiPokok: harga ? harga.GajiPokok : '',
      HargaSatuan: harga ? harga.HargaSatuan : '',
    };

    const statusData = { Status: form.Status, Catatan: form.StatusCatatan.trim() };

    if (id === null) {
      dispatch(addKaryawan({ ...formData, ...statusData }));
      dispatch(showToast('✅ Karyawan ditambahkan!'));
    } else {
      dispatch(updateKaryawan({ id, newData: formData, newStatusData: statusData }));
      dispatch(showToast(
        BKOJabatanValue
          ? `✅ Data diperbarui! Jabatan otomatis disesuaikan mengikuti BKO Jabatan: ${BKOJabatanValue}`
          : '✅ Data diperbarui!',
        BKOJabatanValue ? 5000 : 3000
      ));
    }

    dispatch(saveState());
    onClose();
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: 720 }}>
        <div className="modal-header">
          <h2>{id === null ? '➕ Tambah Karyawan' : '✏️ Edit Karyawan'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">NIP <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-control" value={form.NIP} onChange={set('NIP')} />
          </div>
          <div className="form-group">
            <label className="form-label">Nama <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-control" value={form.Nama} onChange={set('Nama')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">NIK</label>
            <input className="form-control" value={form.NIK} onChange={set('NIK')} />
          </div>
          <div className="form-group">
            <label className="form-label">Grade</label>
            <select className="form-control" value={form.Grade} onChange={set('Grade')}>
              <option value="">— Pilih Grade —</option>
              {gradeOptionsWithLegacy.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Jabatan</label>
            <select className="form-control" value={form.Jabatan} onChange={set('Jabatan')} disabled={!!form.BKOJabatan}>
              <option value="">— Pilih Jabatan —</option>
              {jabatanList.map((j) => <option key={j.nama} value={j.nama}>{j.nama}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">SBU</label>
            <select className="form-control" value={form.SBU} onChange={set('SBU')}>
              <option value="">— Pilih SBU —</option>
              {CONFIG.DEFAULT_SBU.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">BKO Jabatan</label>
            <select className="form-control" value={form.BKOJabatan} onChange={setBKOJabatan}>
              <option value="">— Pilih BKO Jabatan —</option>
              {CONFIG.DEFAULT_BKO_JABATAN.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">BKO SBU</label>
            <select className="form-control" value={form.BKOSBU} onChange={set('BKOSBU')}>
              <option value="">— Pilih BKO SBU —</option>
              {CONFIG.DEFAULT_BKO_SBU.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">PJTK</label>
            <input className="form-control" value={form.PJTK} onChange={set('PJTK')} />
          </div>
          <div className="form-group">
            <label className="form-label">No. SP2K</label>
            <input className="form-control" value={form.NoSP2K} onChange={set('NoSP2K')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nama TL</label>
            <input className="form-control" value={form.NamaTL} onChange={set('NamaTL')} />
          </div>
          <div className="form-group">
            <label className="form-label">Sub Bidang</label>
            <select className="form-control" value={form.SubBidang} onChange={set('SubBidang')}>
              <option value="">— Pilih Sub Bidang —</option>
              {subBidangList.map((s) => <option key={s.nama} value={s.nama}>{s.nama}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tanggal Masuk</label>
            <input type="date" className="form-control" value={form.TglMasuk} onChange={set('TglMasuk')} />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Keluar</label>
            <input type="date" className="form-control" value={form.TglKeluar} onChange={set('TglKeluar')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nomor Telpon</label>
            <input className="form-control" value={form.NoTelp} onChange={set('NoTelp')} />
          </div>
          <div className="form-group">
            <label className="form-label">Ukuran Baju</label>
            <select className="form-control" value={form.UkuranBaju} onChange={set('UkuranBaju')}>
              <option value="">— Pilih Ukuran —</option>
              {CONFIG.UKURAN_BAJU.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.Status} onChange={set('Status')}>
              <option value="Baru Masuk">Baru Masuk</option>
              <option value="Aktif">Aktif</option>
              <option value="Resign">Resign</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Catatan Status</label>
            <input className="form-control" value={form.StatusCatatan} onChange={set('StatusCatatan')} />
          </div>
        </div>

        <div className="flex-end" style={{ marginTop: 15 }}>
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave}>Simpan Data</button>
        </div>
      </div>
    </div>
  );
}
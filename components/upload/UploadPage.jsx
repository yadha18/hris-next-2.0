'use client';

import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { bulkUploadKaryawan, saveState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';

const COLS = [
  'NIP','Nama','NIK','Grade','Jabatan','SBU','Gaji Pokok','Harga Satuan','PJTK','No. SP2K',
  'Nama TL','Sub Bidang','BKO Jabatan','BKO SBU','NIP Baru','Email','Email Korporat',
  'Nama Akun ICRM','Tanggal Masuk','Tanggal Keluar','Ukuran Baju','Nomor Telpon','Status','Catatan Status',
];

const FIELD_MAP = {
  'NIP': 'NIP', 'Nama': 'Nama', 'NIK': 'NIK', 'Grade': 'Grade', 'Jabatan': 'Jabatan', 'SBU': 'SBU',
  'Gaji Pokok': 'GajiPokok', 'Harga Satuan': 'HargaSatuan', 'PJTK': 'PJTK', 'No. SP2K': 'NoSP2K',
  'Nama TL': 'NamaTL', 'Sub Bidang': 'SubBidang', 'BKO Jabatan': 'BKOJabatan', 'BKO SBU': 'BKOSBU',
  'NIP Baru': 'NIPBaru', 'Email': 'Email', 'Email Korporat': 'EmailKorporat',
  'Nama Akun ICRM': 'NamaAkunICRM', 'Tanggal Masuk': 'TglMasuk', 'Tanggal Keluar': 'TglKeluar',
  'Ukuran Baju': 'UkuranBaju', 'Nomor Telpon': 'NoTelp', 'Status': 'Status', 'Catatan Status': 'StatusCatatan',
};

export default function UploadPage() {
  const dispatch = useDispatch();
  const existingKaryawan = useSelector((s) => s.hris.karyawan);
  const fileInputRef = useRef(null);

  const [uploadType, setUploadType] = useState('karyawan');
  const [previewRows, setPreviewRows] = useState([]);

  const cancelUpload = () => {
    setPreviewRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!raw.length) return dispatch(showToast('❌ File kosong!'));

      const header = raw[0].map((h) => String(h).trim());
      const rows = raw.slice(1)
        .map((row) => {
          const obj = {};
          COLS.forEach((col) => {
            const idx = header.findIndex((h) => h.toLowerCase() === col.toLowerCase());
            obj[col] = idx >= 0 ? String(row[idx]) : '';
          });
          return obj;
        })
        .filter((r) => r.NIP || r.Nama);

      const existingNIPs = new Set(existingKaryawan.map((k) => k.NIP));
      const classified = rows.map((r) => ({
        ...r,
        __status: !r.NIP ? 'invalid' : existingNIPs.has(r.NIP) ? 'duplicate' : 'new',
      }));

      setPreviewRows(classified);
      dispatch(showToast(`✅ Berhasil membaca ${rows.length} baris data`));
    };
    reader.readAsBinaryString(file);
  };

  const confirmUpload = () => {
    if (!previewRows.length) return dispatch(showToast('❌ Tidak ada data!'));

    const toInsert = previewRows
      .filter((r) => r.__status === 'new')
      .map((r) => {
        const obj = {};
        COLS.forEach((col) => { obj[FIELD_MAP[col]] = r[col]; });
        return obj;
      });

    dispatch(bulkUploadKaryawan(toInsert));
    dispatch(saveState());
    dispatch(showToast(`✅ ${toInsert.length} data karyawan berhasil disimpan.`));
    cancelUpload();
  };

  const stats = {
    total: previewRows.length,
    new: previewRows.filter((r) => r.__status === 'new').length,
    duplicate: previewRows.filter((r) => r.__status === 'duplicate').length,
    invalid: previewRows.filter((r) => r.__status === 'invalid').length,
  };

  return (
    <div className="page active">
      <div className="page-header">
        <h1>Upload Data</h1>
        <p>Pilih jenis data yang ingin diupload, lalu pilih file Excel (.xlsx / .xls). Maks 10 MB.</p>
      </div>

      <div className="card">
        <div className="card-title">🗂️ Jenis Data</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className={`btn ${uploadType === 'karyawan' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setUploadType('karyawan'); cancelUpload(); }}>
            👥 Data Karyawan
          </button>
          <button className={`btn ${uploadType === 'lembur' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setUploadType('lembur'); cancelUpload(); }}>
            🧾 Data Lembur & SPPD
          </button>
          <button className={`btn ${uploadType === 'laptop' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setUploadType('laptop'); cancelUpload(); }}>
            💻 Monitoring Laptop
          </button>
        </div>
        {uploadType !== 'karyawan' && (
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)' }}>
            Preview untuk tipe ini belum diimplementasikan di komponen ini — polanya identik dengan Data Karyawan.
          </p>
        )}
      </div>

      {uploadType === 'karyawan' && (
        <>
          <div className="card">
            <div className="card-title">📂 Pilih File Excel</div>
            <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-icon">📊</div>
              <h3>Klik untuk pilih file atau seret ke sini</h3>
              <p>Format: .xlsx atau .xls · Maks 10 MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFile} />
          </div>

          {previewRows.length > 0 && (
            <div className="card">
              <div className="flex-between">
                <div className="card-title" style={{ margin: 0 }}>👁 Preview Data</div>
                <div className="flex-end">
                  <button className="btn btn-secondary" onClick={cancelUpload}>✕ Batal</button>
                  <button className="btn btn-primary" onClick={confirmUpload}>✔ Konfirmasi & Simpan</button>
                </div>
              </div>
              <br />
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
                <div className="stat-card"><div className="stat-label">✔ Data Baru</div><div className="stat-value success">{stats.new}</div></div>
                <div className="stat-card"><div className="stat-label">🧩 NIP Sudah Ada</div><div className="stat-value accent">{stats.duplicate}</div></div>
                <div className="stat-card"><div className="stat-label">✕ NIP Kosong</div><div className="stat-value danger">{stats.invalid}</div></div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Status</th>{COLS.map((c) => <th key={c}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(0, 50).map((r, i) => (
                      <tr key={i} style={{ opacity: r.__status === 'new' ? 1 : 0.5 }}>
                        <td>
                          {r.__status === 'new' && <span className="pill pill-green">✔ Baru</span>}
                          {r.__status === 'duplicate' && <span className="pill pill-blue">🧩 Sudah Ada</span>}
                          {r.__status === 'invalid' && <span className="pill pill-red">✕ NIP Kosong</span>}
                        </td>
                        {COLS.map((c) => <td key={c}>{r[c]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
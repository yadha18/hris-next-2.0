'use client';

import { useState, useEffect } from 'react';

const EMPTY_FORM = {
  id: '',
  serialNumber: '',
  merkTipe: '',
  spesifikasi: '',
  nikKaryawan: '',
  namaKaryawan: '',
  sbu: 'SBU Kantor Pusat',
  tanggalPengadaan: new Date().toISOString().split('T')[0],
  status: 'Stok / Tersedia',
  kondisi: 'Baru',
  catatan: '',
};

export default function LaptopModal({ mode, laptop, onClose, onSave }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (laptop) {
      setFormData(laptop);
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [laptop]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isDetail = mode === 'detail';

  return (
    <div className="modal fade show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {mode === 'tambah' && 'Tambah Laptop Baru'}
              {mode === 'edit' && `Edit Data Laptop (${formData.id})`}
              {mode === 'detail' && `Detail Inventaris Laptop (${formData.id})`}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Serial Number & Merk */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Serial Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    disabled={isDetail}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Merk & Tipe Laptop</label>
                  <input
                    type="text"
                    className="form-control"
                    name="merkTipe"
                    placeholder="Contoh: Lenovo ThinkPad E14"
                    value={formData.merkTipe}
                    onChange={handleChange}
                    disabled={isDetail}
                    required
                  />
                </div>

                {/* Spesifikasi */}
                <div className="col-12">
                  <label className="form-label small fw-bold">Spesifikasi Singkat</label>
                  <input
                    type="text"
                    className="form-control"
                    name="spesifikasi"
                    placeholder="Contoh: Core i7, 16GB RAM, 512GB SSD"
                    value={formData.spesifikasi}
                    onChange={handleChange}
                    disabled={isDetail}
                  />
                </div>

                {/* Informasi Karyawan */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold">NIK Karyawan (Pemegang)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nikKaryawan"
                    placeholder="Isi '-' jika tidak ada"
                    value={formData.nikKaryawan}
                    onChange={handleChange}
                    disabled={isDetail}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Nama Karyawan</label>
                  <input
                    type="text"
                    className="form-control"
                    name="namaKaryawan"
                    placeholder="Isi '-' jika di gudang/stok"
                    value={formData.namaKaryawan}
                    onChange={handleChange}
                    disabled={isDetail}
                  />
                </div>

                {/* SBU & Status */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold">SBU</label>
                  <select className="form-select" name="sbu" value={formData.sbu} onChange={handleChange} disabled={isDetail}>
                    <option value="SBU Kantor Pusat">SBU Kantor Pusat</option>
                    <option value="SBU Regional Barat">SBU Regional Barat</option>
                    <option value="SBU Regional Timur">SBU Regional Timur</option>
                    <option value="SBU Anak Perusahaan">SBU Anak Perusahaan</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Status Unit</label>
                  <select className="form-select" name="status" value={formData.status} onChange={handleChange} disabled={isDetail}>
                    <option value="Stok / Tersedia">Stok / Tersedia</option>
                    <option value="Terpakai">Terpakai</option>
                    <option value="Dalam Proses Pengadaan">Dalam Proses Pengadaan</option>
                    <option value="Perbaikan / Service">Perbaikan / Service</option>
                  </select>
                </div>

                {/* Tanggal & Kondisi */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Tanggal Pengadaan</label>
                  <input
                    type="date"
                    className="form-control"
                    name="tanggalPengadaan"
                    value={formData.tanggalPengadaan}
                    onChange={handleChange}
                    disabled={isDetail}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Kondisi Perangkat</label>
                  <input
                    type="text"
                    className="form-control"
                    name="kondisi"
                    placeholder="Contoh: Baru, Bagus, Layar Baret"
                    value={formData.kondisi}
                    onChange={handleChange}
                    disabled={isDetail}
                  />
                </div>

                {/* Catatan */}
                <div className="col-12">
                  <label className="form-label small fw-bold">Catatan / Keterangan</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleChange}
                    disabled={isDetail}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                {isDetail ? 'Tutup' : 'Batal'}
              </button>
              {!isDetail && (
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan Data
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
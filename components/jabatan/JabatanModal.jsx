'use client';

import { useState, useEffect } from 'react';

const EMPTY_FORM = {
  id: '',
  namaJabatan: '',
  subBidang: '',
  level: 'Staff',
  slot: 1,
};

export default function JabatanModal({ mode, data, onClose, onSave }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (data && mode === 'edit') {
      setFormData(data);
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [data, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Konversi slot ke angka sebelum disave
    onSave({ ...formData, slot: parseInt(formData.slot, 10) || 0 });
  };

  return (
    <div className="modal fade show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {mode === 'tambah' ? 'Tambah Jabatan Baru' : `Edit Jabatan (${formData.id})`}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label small fw-bold">Nama Jabatan <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="namaJabatan" 
                  value={formData.namaJabatan} 
                  onChange={handleChange} 
                  placeholder="Contoh: Manajer Operasional"
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Sub Bidang <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="subBidang" 
                  value={formData.subBidang} 
                  onChange={handleChange} 
                  placeholder="Contoh: Operasional & Logistik"
                  required 
                />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Level / Grade</label>
                  <select className="form-select" name="level" value={formData.level} onChange={handleChange}>
                    <option value="C-Level">C-Level / Eksekutif</option>
                    <option value="Manajerial">Manajerial</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Staff">Staff</option>
                    <option value="Kontrak / Magang">Kontrak / Magang</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Target Slot (Jumlah Ideal)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="slot" 
                    min="1"
                    value={formData.slot} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Batal</button>
              <button type="submit" className="btn btn-primary btn-sm">
                <i className="bi bi-save me-1"></i> Simpan Data
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
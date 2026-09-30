'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSlotConfig, saveState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';

export default function EditSlotModal({ sbu, onClose }) {
  const dispatch = useDispatch();
  const detail = useSelector((s) => s.hris.slotConfig[sbu]);
  const jabatanList = useSelector((s) => s.hris.jabatan);
  const [rows, setRows] = useState({ ...detail.jabatan });
  const [addJab, setAddJab] = useState('');

  const total = Object.values(rows).reduce((s, v) => s + (Number(v) || 0), 0);
  const available = jabatanList.map((j) => j.nama).filter((j) => !(j in rows));

  const handleSave = () => {
    dispatch(updateSlotConfig({ sbu, jabatanMap: rows }));
    dispatch(saveState());
    dispatch(showToast('✅ Slot fix diperbarui!'));
    onClose();
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-header"><h2>✏️ Edit Slot Fix — {sbu}</h2></div>
        <div id="editSlotRows" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {Object.entries(rows).map(([jab, val]) => (
            <div key={jab} className="edit-slot-row">
              <span className="edit-slot-row-label">{jab}</span>
              <input type="number" min="0" className="form-control edit-slot-row-input" value={val}
                onChange={(e) => setRows((r) => ({ ...r, [jab]: Number(e.target.value) }))} />
              <button className="btn btn-danger btn-sm" onClick={() => setRows((r) => { const c = { ...r }; delete c[jab]; return c; })}>✕</button>
            </div>
          ))}
        </div>
        <div className="form-row">
          <select className="form-control" value={addJab} onChange={(e) => setAddJab(e.target.value)}>
            <option value="">— Pilih Jabatan untuk Ditambahkan —</option>
            {available.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={() => { if (addJab) { setRows((r) => ({ ...r, [addJab]: 0 })); setAddJab(''); } }}>➕</button>
        </div>
        <p style={{ marginTop: 12, fontSize: 13 }}>Total: <strong>{total}</strong> slot</p>
        <div className="flex-end" style={{ marginTop: 15 }}>
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';

export default function ConfirmHapusSemuaModal({ title, countLabel, count, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');
  const valid = confirmText.trim() === 'HAPUS SEMUA';

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-header">
          <h2>🗑 {title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="info-note" style={{ background: 'rgba(239,68,68,.08)', borderColor: 'rgba(239,68,68,.25)', color: 'var(--danger)', marginBottom: 20 }}>
          ⚠️ <strong>Peringatan keras!</strong> Seluruh data akan dihapus permanen dan tidak dapat dikembalikan.
        </div>
        <div className="card" style={{ background: 'var(--surface2)', marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: 13 }}>
            <span style={{ color: 'var(--text2)' }}>{countLabel}</span>
            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{count}</span>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ color: 'var(--danger)' }}>Ketik <strong>HAPUS SEMUA</strong> untuk konfirmasi</label>
          <input
            className="form-control"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="HAPUS SEMUA"
            style={{ borderColor: 'rgba(239,68,68,.4)' }}
          />
        </div>
        <div className="flex-end">
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-danger" disabled={!valid} style={{ opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }} onClick={onConfirm}>
            🗑 Hapus Semua Data
          </button>
        </div>
      </div>
    </div>
  );
}
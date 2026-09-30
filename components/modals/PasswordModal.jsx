'use client';

import { useState } from 'react';

export default function PasswordModal({ error, onSubmit, onClose }) {
  const [password, setPassword] = useState('');
  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: 380 }}>
        <div className="modal-header"><h2>🔒 Akses Superadmin</h2></div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password" className="form-control" autoFocus
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit(password)}
          />
          {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{error}</div>}
        </div>
        <div className="flex-end">
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={() => onSubmit(password)}>Masuk</button>
        </div>
      </div>
    </div>
  );
}
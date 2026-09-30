'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addJabatan, removeJabatan, addSubBidang, removeSubBidang, saveState } from '@/store/slices/hrisSlice';
import { showToast } from '@/store/slices/uiSlice';

function ListEditor({ title, items, onAdd, onRemove }) {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (!input.trim()) return dispatch(showToast(`❌ Nama ${title} wajib diisi!`));
    dispatch(onAdd(input));
    dispatch(saveState());
    setInput('');
  };
  const handleRemove = (nama) => {
    if (!confirm(`Hapus "${nama}"?`)) return;
    dispatch(onRemove(nama));
    dispatch(saveState());
    dispatch(showToast('🗑 Dihapus'));
  };

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="search-bar">
        <input placeholder={`Nama ${title} baru...`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
        <button className="btn btn-primary" onClick={handleAdd}>➕ Tambah</button>
      </div>
      {items.map((it) => (
        <div key={it.nama} className="jabatan-item">
          <span className="jabatan-item-name">{it.nama}</span>
          <button className="btn btn-danger btn-sm" onClick={() => handleRemove(it.nama)}>Hapus</button>
        </div>
      ))}
    </div>
  );
}

export default function JabatanManager() {
  const jabatan = useSelector((s) => s.hris.jabatan);
  const subBidang = useSelector((s) => s.hris.subBidang);

  return (
    <div className="page active">
      <div className="page-header"><h1>📋 Daftar Jabatan & Sub Bidang</h1></div>
      <ListEditor title="Jabatan" items={jabatan} onAdd={addJabatan} onRemove={removeJabatan} />
      <ListEditor title="Sub Bidang" items={subBidang} onAdd={addSubBidang} onRemove={removeSubBidang} />
    </div>
  );
}
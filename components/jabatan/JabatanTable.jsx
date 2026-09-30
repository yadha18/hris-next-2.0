'use client';

import { useState, useMemo } from 'react';

export default function JabatanTable({ data, onEdit, onDelete }) {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    return data.filter((item) => 
      item.namaJabatan.toLowerCase().includes(search.toLowerCase()) ||
      item.subBidang.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  return (
    <div>
      <div className="row mb-3">
        <div className="col-12 col-md-4">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Cari ID, Nama, atau Sub Bidang..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Nama Jabatan</th>
              <th>Sub Bidang</th>
              <th>Level / Grade</th>
              <th>Target Slot</th>
              <th className="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="fw-semibold text-muted">{item.id}</td>
                  <td className="fw-bold">{item.namaJabatan}</td>
                  <td>{item.subBidang}</td>
                  <td>
                    <span className="badge bg-secondary-subtle text-secondary border">
                      {item.level}
                    </span>
                  </td>
                  <td>{item.slot} Orang</td>
                  <td className="text-end">
                    <button className="btn btn-light btn-sm me-1" onClick={() => onEdit(item)} title="Edit">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-light btn-sm text-danger" onClick={() => onDelete(item.id)} title="Hapus">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">Data jabatan tidak ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
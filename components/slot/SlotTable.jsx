'use client';

import { useState, useMemo } from 'react';

export default function SlotTable({ data, onEdit }) {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    return data.filter((item) => 
      item.sbu.toLowerCase().includes(search.toLowerCase()) ||
      item.grade.toLowerCase().includes(search.toLowerCase())
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
              placeholder="Cari SBU atau Grade..." 
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
              <th>ID Config</th>
              <th>SBU</th>
              <th>Grade / Level</th>
              <th className="text-center">Target Slot</th>
              <th className="text-center">Saat Ini Terisi</th>
              <th>Status Kekosongan</th>
              <th className="text-end">Aksi Superadmin</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const sisa = item.slot - item.terisi;
                let statusBadge = 'bg-success-subtle text-success';
                let statusText = 'Sesuai Target';
                
                if (sisa > 0) {
                  statusBadge = 'bg-warning-subtle text-warning';
                  statusText = `Kurang ${sisa} Orang`;
                } else if (sisa < 0) {
                  statusBadge = 'bg-danger-subtle text-danger';
                  statusText = `Overload ${Math.abs(sisa)} Orang`;
                }

                return (
                  <tr key={item.id}>
                    <td className="fw-semibold text-muted small">{item.id}</td>
                    <td className="fw-bold">{item.sbu}</td>
                    <td>{item.grade}</td>
                    <td className="text-center fs-5 fw-bold">{item.slot}</td>
                    <td className="text-center">{item.terisi}</td>
                    <td>
                      <span className={`badge rounded-pill border ${statusBadge}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => onEdit(item)}>
                        <i className="bi bi-shield-lock me-1"></i> Edit Slot
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">Konfigurasi tidak ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
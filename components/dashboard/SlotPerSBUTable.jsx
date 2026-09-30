'use client';

import { useMemo } from 'react';

export default function SlotPerSbuTable({ karyawan, slotConfig }) {
  const rows = useMemo(() => {
    return Object.entries(slotConfig || {}).map(([sbu, fix]) => {
      const terisi = karyawan.filter((k) => k.sbu === sbu && k.status !== 'Resign').length;
      return { sbu, fix: Number(fix) || 0, terisi, sisa: Math.max(Number(fix) - terisi, 0) };
    });
  }, [karyawan, slotConfig]);

  if (rows.length === 0) {
    return <p style={{ color: 'var(--text2)', fontSize: 13 }}>Belum ada konfigurasi slot per SBU.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>SBU</th><th>Slot Fix</th><th>Terisi</th><th>Sisa</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sbu}>
              <td>{r.sbu}</td>
              <td>{r.fix}</td>
              <td className="accent">{r.terisi}</td>
              <td className={r.sisa > 0 ? 'warning' : ''}>{r.sisa}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TipeKaryawanChart({ karyawan }) {
  const data = useMemo(() => {
    const now = new Date();
    const bulanIni = karyawan.filter((k) => {
      const d = new Date(k.tanggalUpdate || k.tanggalMasuk);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const counts = {};
    for (const k of bulanIni) {
      const tipe = k.tipe || 'Tidak Diketahui';
      counts[tipe] = (counts[tipe] || 0) + 1;
    }

    return Object.entries(counts).map(([tipe, jumlah]) => ({ tipe, jumlah }));
  }, [karyawan]);

  if (data.length === 0) {
    return <p style={{ color: 'var(--text2)', fontSize: 13 }}>Belum ada perubahan data karyawan bulan ini.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <XAxis dataKey="tipe" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="jumlah" fill="var(--accent)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
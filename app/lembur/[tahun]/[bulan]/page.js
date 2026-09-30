'use client';

import { useParams } from 'next/navigation';
import LemburTable from '@/components/lembur/LemburTable';

export default function Page() {
  const { tahun, bulan } = useParams();
  const bulanCap = bulan.charAt(0).toUpperCase() + bulan.slice(1);
  return <LemburTable bulanTahun={`${bulanCap} ${tahun}`} />;
}
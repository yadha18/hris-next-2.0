export const CONFIG = {
  DEFAULT_JABATAN: [
    'ACCOUNT EXECUTIVE GRADE 1', 'ACCOUNT EXECUTIVE GRADE 2', 'COLLECTION SBU',
    'ACCOUNT MANAGER JUNIOR', 'ACCOUNT MANAGER SENIOR', 'OFFICER MARKETING',
    'VALIDASI SBU', 'ADMINISTRASI SALES', 'COLLECTION PUSAT', 'DATA ANALYST & DESIGN ENGINEER',
  ],
  DEFAULT_SBU: [
    'SUMATERA BAGIAN UTARA', 'SUMATERA BAGIAN TENGAH', 'SUMATERA BAGIAN SELATAN',
    'SULAWESI & INDONESIA TIMUR', 'KALIMANTAN', 'JAWA BAGIAN TIMUR',
    'JAWA BAGIAN TENGAH', 'JAWA BAGIAN BARAT', 'JAKARTA & BANTEN',
    'BALI & NUSA TENGGARA', 'PUSAT',
  ],
  TOTAL_LAPTOP_LOCKED_VALUE: 138,
  JABATAN_LAPTOP_EXCLUDED: ['ACCOUNT EXECUTIVE GRADE 1', 'ACCOUNT EXECUTIVE GRADE 2'],
  DEFAULT_GRADE: [
    'OFFICER GRADE-1', 'OFFICER GRADE-8',
    'MARKETING GRADE-9', 'MARKETING GRADE-10', 'MARKETING GRADE-16',
    'MARKETING GRADE-23', 'MARKETING GRADE-25', 'MARKETING GRADE-26',
    'MARKETING GRADE-29', 'MARKETING GRADE-31', 'MARKETING GRADE-33', 'MARKETING GRADE-35',
    'SALES GRADE-1', 'SALES GRADE-2',
  ],
  HARGA_SBU_GRADE: [
    { SBU: 'SUMATERA BAGIAN UTARA', Grade: 'OFFICER GRADE-1', HargaSatuan: 5978000, GajiPokok: 4379000 },
    // ... (salin semua 40 baris apa adanya dari script.js lama, tidak berubah)
  ],
  DEFAULT_BKO_JABATAN: [
    'ACCOUNT EXECUTIVE GRADE 1', 'ACCOUNT EXECUTIVE GRADE 2', 'COLLECTION SBU',
    'ACCOUNT MANAGER JUNIOR', 'ACCOUNT MANAGER SENIOR', 'OFFICER MARKETING',
    'VALIDASI SBU', 'ADMINISTRASI SALES', 'COLLECTION PUSAT', 'DATA ANALYST & DESIGN ENGINEER',
  ],
  DEFAULT_BKO_SBU: [
    'SUMATERA BAGIAN UTARA', 'SUMATERA BAGIAN TENGAH', 'SUMATERA BAGIAN SELATAN',
    'SULAWESI & INDONESIA TIMUR', 'KALIMANTAN', 'JAWA BAGIAN TIMUR',
    'JAWA BAGIAN TENGAH', 'JAWA BAGIAN BARAT', 'JAKARTA & BANTEN',
    'BALI & NUSA TENGGARA', 'PUSAT',
  ],
  SBU_ALIAS_MAP: [
    { canonical: 'SUMATERA BAGIAN UTARA', aliases: ['SBU', 'SUMBAGUT', 'PADANG SIDEMPUAN', 'MEDAN', 'ACEH'] },
    // ... salin semua entri apa adanya
  ],
  JABATAN_ALIAS_MAP: [
    { canonical: 'VALIDASI SBU', aliases: ['VERIFICATOR'] },
    // ... salin semua entri apa adanya
  ],
  UKURAN_BAJU: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
  TAGIHAN_OPTIONS: ['SPPD 1 2', 'Lembur'],
  PAGU_PER_BULAN_STATIC: 15000000,
  MAN_FEE_PERSEN: 0.07,
  BULAN_NAMA: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
  TAHUN_LEMBUR_LIST: [2026, 2027],
  TAHUN_LEMBUR: 2026,
  STATUS_LAPTOP_OPTIONS: ['Aktif', 'Belum Dikembalikan', 'Sudah Dikembalikan'],
  DEFAULT_PJTK: 'PT. HALEYORA POWERINDO',
  DEFAULT_NO_SP2K: '4500028490',
};

// Getter lama (this.BULAN_OPTIONS) jadi fungsi biasa — lebih eksplisit di ESM
export function getBulanOptions() {
  const list = [];
  CONFIG.TAHUN_LEMBUR_LIST.forEach((th) => CONFIG.BULAN_NAMA.forEach((b) => list.push(`${b} ${th}`)));
  return list;
}

export function getStatusLaptopFilterOptions() {
  return [...CONFIG.STATUS_LAPTOP_OPTIONS, 'Belum Dapat Laptop', 'Tidak Dapat Laptop'];
}

export const STATUS_DEF = {
  'Baru Masuk': { pill: 'pill-green', label: '🟢 Baru Masuk' },
  'Aktif':      { pill: 'pill-blue',  label: '🔵 Aktif' },
  'Resign':     { pill: 'pill-red',   label: '🔴 Resign' },
};
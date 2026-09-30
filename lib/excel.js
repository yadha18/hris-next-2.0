import * as XLSX from 'xlsx';

function downloadWorkbook(data, sheetName, fileName) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

export function exportKaryawanExcel(karyawan) {
  const rows = karyawan.map((k) => ({
    NIP: k.nip,
    Nama: k.nama,
    Jabatan: k.jabatan,
    Grade: k.grade,
    SBU: k.sbu,
    Status: k.status,
    'Tgl Update': k.tanggalUpdate,
  }));
  downloadWorkbook(rows, 'Data Karyawan', `Data_Karyawan_${todayStr()}.xlsx`);
}

export function exportLemburExcel(lembur) {
  const rows = lembur.map((l) => ({
    NIP: l.nip,
    Nama: l.nama,
    Nominal: l.nominal,
    SBU: l.sbu,
    Jabatan: l.jabatan,
    Bulan: l.bulan,
    Tagihan: l.tagihan,
  }));
  downloadWorkbook(rows, 'Lembur SPPD', `Lembur_SPPD_${todayStr()}.xlsx`);
}

export function exportLaptopExcel(laptop) {
  const rows = laptop.map((l) => ({
    NIP: l.nip,
    'Nama Perangkat': l.namaPerangkat,
    PA: l.pa,
    'Nama Pengguna': l.namaPengguna,
    Jabatan: l.jabatan,
    Grade: l.grade,
    'Serial Number': l.serialNumber,
    'Regional (SBU)': l.sbu,
    'Status Laptop': l.status,
  }));
  downloadWorkbook(rows, 'Monitoring Laptop', `Monitoring_Laptop_${todayStr()}.xlsx`);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
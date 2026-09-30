import { generateId, getTodayDate, resolveJabatan, resolveSBU, parseNominal, normalizePhone, normalizeStatus, normalizeBulan, normalizeTagihan, normalizeStatusLaptop } from './utils';

export function KaryawanModel(data = {}) {
  return {
    id: data.id || generateId(),
    NIP: String(data.NIP || '').trim(),
    Nama: String(data.Nama || '').trim(),
    NIK: String(data.NIK || '').trim(),
    Grade: String(data.Grade || '').trim().toUpperCase(),
    Jabatan: resolveJabatan(String(data.Jabatan || '').trim()),
    SBU: resolveSBU(String(data.SBU || '').trim()),
    GajiPokok: parseNominal(data.GajiPokok),
    HargaSatuan: parseNominal(data.HargaSatuan),
    PJTK: String(data.PJTK || '').trim(),
    NoSP2K: String(data.NoSP2K || '').trim(),
    NamaTL: String(data.NamaTL || '').trim(),
    SubBidang: String(data.SubBidang || '').trim(),
    BKOJabatan: resolveJabatan(String(data.BKOJabatan || '').trim()),
    BKOSBU: resolveSBU(String(data.BKOSBU || '').trim()),
    NIPBaru: String(data.NIPBaru || '').trim(),
    Email: String(data.Email || '').trim(),
    EmailKorporat: String(data.EmailKorporat || '').trim(),
    NamaAkunICRM: String(data.NamaAkunICRM || '').trim(),
    TglMasuk: String(data.TglMasuk || '').trim(),
    TglKeluar: String(data.TglKeluar || '').trim(),
    UkuranBaju: String(data.UkuranBaju || '').trim().toUpperCase(),
    NoTelp: normalizePhone(data.NoTelp || ''),
    TglUpdate: data.TglUpdate || getTodayDate(),
    Status: normalizeStatus(data.Status),
    StatusManual: typeof data.StatusManual === 'boolean' ? data.StatusManual : false,
    StatusCatatan: data.StatusCatatan || '',
  };
}

export function LogChangeModel(nik, nama, type, oldVal, newVal, catatan = '') {
  return { id: generateId(), ts: getTodayDate(), nik, nama, type, oldVal: oldVal || '-', newVal: newVal || '-', catatan };
}

export function LemburModel(data = {}) {
  return {
    id: data.id || generateId(),
    NIP: String(data.NIP || '').trim(),
    Nama: String(data.Nama || '').trim(),
    Nominal: parseNominal(data.Nominal),
    SBU: resolveSBU(String(data.SBU || '').trim()),
    Jabatan: resolveJabatan(String(data.Jabatan || '').trim()),
    Bulan: normalizeBulan(data.Bulan),
    Tagihan: normalizeTagihan(data.Tagihan),
  };
}

export function LaptopModel(data = {}) {
  return {
    id: data.id || generateId(),
    NIP: String(data.NIP || '').trim(),
    NamaPerangkat: String(data.NamaPerangkat || '').trim(),
    PA: String(data.PA || '').trim(),
    NamaPengguna: String(data.NamaPengguna || '').trim(),
    SerialNumber: String(data.SerialNumber || '').trim(),
    SBU: resolveSBU(String(data.SBU || '').trim()),
    Status: normalizeStatusLaptop(data.Status),
    BuktiBA: data.BuktiBA || null,
    BuktiBAFileName: data.BuktiBAFileName || null,
  };
}
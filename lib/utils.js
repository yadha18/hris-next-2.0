import { CONFIG, STATUS_DEF } from './config';

let idCounter = Date.now();
export function generateId() {
  idCounter += 1;
  return idCounter;
}

export function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function monthsSince(dateStr) {
  if (!dateStr) return null;
  const start = new Date(dateStr);
  if (isNaN(start.getTime())) return null;
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

export function monthsBetweenDates(startStr, endStr) {
  if (!startStr) return null;
  const start = new Date(startStr);
  if (isNaN(start.getTime())) return null;
  const end = endStr ? new Date(endStr) : new Date();
  if (isNaN(end.getTime())) return null;
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

export function formatDurationMonths(months) {
  if (months === null || months === undefined) return '—';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years > 0 && rem > 0) return `${years} tahun ${rem} bulan`;
  if (years > 0) return `${years} tahun`;
  if (months === 0) return '< 1 bulan';
  return `${months} bulan`;
}

export function formatDateID(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function resolveSBU(raw) {
  if (!raw) return raw;
  const upper = String(raw).trim().toUpperCase();
  const exact = CONFIG.DEFAULT_SBU.find((s) => s === upper);
  if (exact) return exact;
  for (const entry of CONFIG.SBU_ALIAS_MAP) {
    const sorted = [...entry.aliases].sort((a, b) => b.length - a.length);
    for (const alias of sorted) if (upper.includes(alias)) return entry.canonical;
  }
  return upper;
}

export function resolveJabatan(raw) {
  if (!raw) return raw;
  const upper = String(raw).trim().toUpperCase();
  const exact = CONFIG.DEFAULT_JABATAN.find((j) => j === upper);
  if (exact) return exact;
  for (const entry of CONFIG.JABATAN_ALIAS_MAP) {
    const sorted = [...entry.aliases].sort((a, b) => b.length - a.length);
    for (const alias of sorted) if (upper === alias) return entry.canonical;
  }
  return upper;
}

export function normalizeStatus(raw) {
  const val = String(raw || '').trim().toLowerCase();
  if (!val) return 'Aktif';
  if (['baru masuk', 'baru', 'new', 'karyawan baru'].includes(val)) return 'Baru Masuk';
  if (['resign', 'resigned', 'keluar', 'non aktif', 'nonaktif', 'non-aktif', 'berhenti', 'out'].includes(val)) return 'Resign';
  return 'Aktif';
}

export function normalizeStatusLaptop(raw) {
  const val = String(raw || '').trim();
  return CONFIG.STATUS_LAPTOP_OPTIONS.includes(val) ? val : '';
}

export function normalizePhone(raw) {
  if (!raw) return '';
  let digits = String(raw).trim().replace(/[\s\-()]/g, '').replace(/^\+/, '');
  if (digits.startsWith('62')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return digits ? '+62' + digits : '';
}

export function normalizeTagihan(raw) {
  const val = String(raw || '').trim();
  return CONFIG.TAGIHAN_OPTIONS.find((t) => t.toLowerCase() === val.toLowerCase()) || val;
}

export function normalizeBulan(val) {
  const s = String(val || '').trim();
  if (!s) return '';
  const found = CONFIG.BULAN_NAMA.find((b) => new RegExp('^' + b, 'i').test(s));
  if (!found) return s;
  const yearMatch = s.match(/\b(20\d{2})\b/);
  const tahun = yearMatch && CONFIG.TAHUN_LEMBUR_LIST.includes(Number(yearMatch[1])) ? Number(yearMatch[1]) : CONFIG.TAHUN_LEMBUR;
  return `${found} ${tahun}`;
}

export function parseNominal(val) {
  if (typeof val === 'number') return val;
  const digits = String(val || '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

export function formatRupiah(num) {
  const n = Number(num) || 0;
  return 'Rp' + n.toLocaleString('id-ID');
}

export function statusPillMeta(status) {
  return STATUS_DEF[status] || { pill: 'pill-gray', label: status || '—' };
}

export function sortGradeList(list) {
  return list.slice().sort((a, b) => {
    const numA = parseInt((String(a).match(/(\d+)\s*$/) || [])[1], 10);
    const numB = parseInt((String(b).match(/(\d+)\s*$/) || [])[1], 10);
    const nA = isNaN(numA) ? Infinity : numA;
    const nB = isNaN(numB) ? Infinity : numB;
    if (nA !== nB) return nA - nB;
    return String(a).localeCompare(String(b));
  });
}

export function matchGradeToStandard(oldGradeText, jabatanText) {
  const raw = String(oldGradeText || '').toUpperCase();
  if (!raw) return null;
  if (CONFIG.DEFAULT_GRADE.includes(raw)) return raw;
  const numMatch = raw.match(/(\d+)/);
  if (!numMatch) return null;
  const num = numMatch[1];
  const candidates = CONFIG.DEFAULT_GRADE.filter((g) => (g.match(/-(\d+)$/) || [])[1] === num);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  const jab = String(jabatanText || '').toUpperCase();
  const findByKeyword = (text) => candidates.find((c) => text.includes(c.split(' GRADE-')[0]));
  return findByKeyword(raw) || findByKeyword(jab) || null;
}

export function findHargaSbuGrade(sbu, grade) {
  if (!sbu || !grade) return null;
  return CONFIG.HARGA_SBU_GRADE.find((h) => h.SBU === sbu && h.Grade === grade) || null;
}

// Compress gambar tetap murni (butuh DOM Image/Canvas — panggil hanya dari client component)
export function compressImageFile(file, maxWidth = 900, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}
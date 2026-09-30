// lib/auth.js

/**
 * Memverifikasi kecocokan password superadmin.
 * Menggunakan kredensial hardcoded untuk proteksi gate UI.
 */
export const verifySuperadmin = (password) => {
  const SUPERADMIN_PASS = 'admin264';
  return password === SUPERADMIN_PASS;
};
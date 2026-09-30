export const DEFAULT_STATE = {
  karyawan: [],
  jabatan: [],
  log: [],
  slotConfig: {},
  lembur: [],
  lemburSbuConfig: {},
  tiketHPI: 0,
  laptop: [],
  subBidang: [],
};

export function normalizeStatePayload(body) {
  const {
    karyawan, jabatan, log, slotConfig,
    lembur, lemburSbuConfig, tiketHPI, laptop, subBidang,
  } = body || {};

  if (!Array.isArray(karyawan) || !Array.isArray(jabatan) || !Array.isArray(log)) {
    return { error: 'karyawan, jabatan, dan log harus berupa array.' };
  }

  return {
    data: {
      karyawan, jabatan, log,
      slotConfig: slotConfig || {},
      lembur: Array.isArray(lembur) ? lembur : [],
      lemburSbuConfig: lemburSbuConfig || {},
      tiketHPI: Number(tiketHPI) || 0,
      laptop: Array.isArray(laptop) ? laptop : [],
      subBidang: Array.isArray(subBidang) ? subBidang : [],
      updatedAt: new Date(),
    },
  };
}
const QRIS_CONFIG_KEY = 'scoopmatch_qris_config_v3';
const LEGACY_QRIS_KEYS = ['scoopmatch_qris_config_v1', 'scoopmatch_qris_config_v2'];

export const DEFAULT_QRIS_CONFIG = {
  merchantName: 'RESYA STORE - FOOD',
  merchantNmid: 'ID1026557732124',
  merchantCity: 'INDONESIA',
  adminWhatsapp: '081223997778',
  qrisImageUrl: '/qris-gabintang5.jpg',
  acceptCash: true,
  acceptQris: true,
};

export function getQRISConfig() {
  try {
    for (const key of LEGACY_QRIS_KEYS) {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    }
    const raw = localStorage.getItem(QRIS_CONFIG_KEY);
    if (!raw) return DEFAULT_QRIS_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_QRIS_CONFIG,
      ...parsed,
      qrisImageUrl: parsed.qrisImageUrl || DEFAULT_QRIS_CONFIG.qrisImageUrl,
    };
  } catch {
    return DEFAULT_QRIS_CONFIG;
  }
}

export function saveQRISConfig(config) {
  try {
    localStorage.setItem(QRIS_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save QRIS config', e);
    return false;
  }
}

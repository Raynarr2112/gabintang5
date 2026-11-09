const PO_SETTINGS_KEY = 'scoopmatch_po_settings_v2';
const LEGACY_PO_SETTINGS_KEY = 'scoopmatch_po_settings_v1';

export const DEFAULT_PO_SETTINGS = {
  isPoActive: true,
  eventName: 'Open PO Rabu - Jumat',
  eventDate: 'Produksi Sabtu • Pengantaran Senin / Selasa',
  location: 'GABINTANG5 - Gabin Ice Cream',
  pickupDeadline: 'Senin / Selasa',
  sessions: [
    {
      id: 'hari-senin',
      name: 'Hari Senin',
      timeRange: 'Pengambilan / Pengiriman Hari Senin (Hasil Produksi Sabtu)',
      quota: 50,
      icon: '📅',
    },
    {
      id: 'hari-selasa',
      name: 'Hari Selasa',
      timeRange: 'Pengambilan / Pengiriman Hari Selasa (Hasil Produksi Sabtu)',
      quota: 50,
      icon: '🗓️',
    },
  ],
};

export function getPoSettings() {
  try {
    if (localStorage.getItem(LEGACY_PO_SETTINGS_KEY)) {
      localStorage.removeItem(LEGACY_PO_SETTINGS_KEY);
    }
    const raw = localStorage.getItem(PO_SETTINGS_KEY);
    if (!raw) return DEFAULT_PO_SETTINGS;
    return { ...DEFAULT_PO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PO_SETTINGS;
  }
}

export function savePoSettings(settings) {
  try {
    localStorage.setItem(PO_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save PO settings', e);
    return false;
  }
}

/**
 * Calculates remaining quota for a given session based on existing orders
 */
export function calculateSlotRemainingQuota(sessionId, allOrders = [], poSettings = DEFAULT_PO_SETTINGS) {
  const session = (poSettings.sessions || []).find(s => s.id === sessionId);
  if (!session) return 0;

  const usedQuota = allOrders.filter(
    order => order.orderType === 'po' && order.poSessionId === sessionId
  ).length;

  return Math.max(0, session.quota - usedQuota);
}

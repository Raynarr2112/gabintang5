// Format currency to Indonesian Rupiah
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
}

const COUNTER_KEY = 'scoopmatch_order_counter_v2';

// Generate unique sequential order ID like #SCOOP-001 (resets daily)
export function generateOrderId() {
  try {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const raw = localStorage.getItem(COUNTER_KEY);
    let state = { date: todayStr, count: 0 };
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.date === todayStr && typeof parsed.count === 'number') {
          state = parsed;
        }
      } catch {
        // silent fallback
      }
    }
    state.count += 1;
    localStorage.setItem(COUNTER_KEY, JSON.stringify(state));
    return `#SCOOP-${String(state.count).padStart(3, '0')}`;
  } catch {
    const fallbackNum = Math.floor(100 + Math.random() * 900);
    return `#SCOOP-${fallbackNum}`;
  }
}

// Format timestamp to localized readable string
export function formatTime(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
}

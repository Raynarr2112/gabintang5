// Format currency to Indonesian Rupiah
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
}

const ORDER_ID_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomOrderSuffix(length = 5) {
  let result = '';
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i += 1) {
      result += ORDER_ID_CHARS[bytes[i] % ORDER_ID_CHARS.length];
    }
    return result;
  }
  for (let i = 0; i < length; i += 1) {
    result += ORDER_ID_CHARS[Math.floor(Math.random() * ORDER_ID_CHARS.length)];
  }
  return result;
}

// Generate globally unique order ID like #SCOOP-7K4M9 (collision-safe across devices & days)
export function generateOrderId(existingOrderIds = []) {
  const existingSet = new Set(
    (existingOrderIds || []).map(id => String(id || '').trim().toUpperCase())
  );

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `#SCOOP-${randomOrderSuffix(5)}`;
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  return `#SCOOP-${Date.now().toString(36).slice(-5).toUpperCase()}`;
}

// Format timestamp to localized readable string
export function formatTime(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
}

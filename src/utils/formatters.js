// Format currency to Indonesian Rupiah
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
}

// Extract numeric sequence from order IDs like #SCOOP-001, #SCOOP-012, or #SCOOP-002-319
function extractOrderNumber(orderId) {
  const match = String(orderId || '').trim().toUpperCase().match(/^#?SCOOP-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Generate clean sequential order ID like #SCOOP-001, #SCOOP-002, ...
// Always picks max(existingQueueNumbers) + 1 so multiple devices stay in sync without overwriting
export function generateOrderId(existingOrderIds = []) {
  let maxNum = 0;
  for (const id of existingOrderIds || []) {
    const num = extractOrderNumber(id);
    if (num > maxNum) {
      maxNum = num;
    }
  }

  const nextNum = maxNum + 1;
  return `#SCOOP-${String(nextNum).padStart(3, '0')}`;
}

// Format timestamp to localized readable string
export function formatTime(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
}

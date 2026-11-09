import { TOPPINGS, SIZE_OPTIONS, SERVING_OPTIONS } from '../data/flavors';
import { formatRupiah } from './formatters';

/**
 * Membersihkan dan menormalisasi nomor HP ke format internasional WhatsApp (628xxx)
 * Contoh:
 * - "08123456789" -> "628123456789"
 * - "+62 812-3456-789" -> "628123456789"
 * - "628123456789" -> "628123456789"
 */
export function normalizeWhatsAppNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';

  // Hapus semua karakter non-angka
  let cleaned = phone.replace(/\D/g, '');

  // Hilangkan prefix 0 di awal, ganti dengan 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}

/**
 * Validasi apakah nomor HP tampak valid untuk Indonesia
 */
export function isValidIndonesianPhone(phone) {
  const normalized = normalizeWhatsAppNumber(phone);
  // Nomor HP Indonesia biasanya 10-15 digit berawalan 628
  return /^628[1-9][0-9]{7,11}$/.test(normalized);
}

/**
 * Menghasilkan link WhatsApp (wa.me) langsung untuk memberitahu pembeli bahwa es krim sudah jadi
 */
export function createOrderReadyWhatsAppUrl(order) {
  const phone = normalizeWhatsAppNumber(order.customerPhone);
  if (!phone) return null;

  const sizeObj = SIZE_OPTIONS.find(s => s.id === order.size);
  const servingObj = SERVING_OPTIONS.find(s => s.id === order.serving);

  const flavorText = order.secondFlavor
    ? `${order.flavor?.name || ''} + ${order.secondFlavor?.name || ''}`
    : (order.flavor?.name || '');

  const toppingsFormatted = (order.toppings || [])
    .map(tid => {
      const t = TOPPINGS.find(item => item.id === tid);
      return t ? `${t.icon} ${t.name}` : tid;
    })
    .join(', ');

  const poScheduleLine = order.orderType === 'po' && order.poSessionName
    ? `• Hari Penerimaan PO: ${order.poSessionName}\n`
    : '';

  const message =
`Halooo Kak ${order.customerName || 'Pelanggan'} yang manis! 🎉🥪🍦

Yuhuuu~ Gabin Es Krim pesanan Kakak di GABINTANG5 udah SELESAI diracik dan SIAP DIAMBIL nih! ✨

📋 Detail Pesanan Kakak:
• No. Antrean: ${order.orderId}
• Menu: ${flavorText}
• Pilihan: ${sizeObj?.name || order.size} (${servingObj?.name || order.serving})
${toppingsFormatted ? `• Topping: ${toppingsFormatted}\n` : ''}${poScheduleLine}• Total: ${formatRupiah(order.totalPrice || 0)}

Yuk langsung mampir ke meja booth kami dan tunjukin chat ini sebelum es krimnya kangen berat (alias meleleh hehe)! 🏃💨

Selamat menikmati sensasi renyah dingin yang bikin nagih yaa! 🥰💖`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Link WhatsApp untuk pembeli menyimpan/berbagi tiket ke chat WA sendiri
 */
export function createCustomerShareTicketUrl(order) {
  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?track=${encodeURIComponent(order.orderId.replace('#', ''))}`
    : '';

  const message =
`Yuhuuu! Ini kupon antrean Gabin Es Krim aku di GABINTANG5 🥪🍦✨

• No. Antrean: ${order.orderId}
• Nama: ${order.customerName}
• Status: ${order.status === 'selesai' ? 'Siap Diambil 🎉' : order.status === 'diproses' ? 'Lagi Dibuat Barista 🧑‍🍳' : 'Menunggu di Kasir ⏳'}

Cek status antrean secara live di sini yaa:
${trackingUrl}`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { formatRupiah, formatTime } from '../utils/formatters';
import { TOPPINGS, SERVING_OPTIONS } from '../data/flavors';
import { createCustomerShareTicketUrl } from '../utils/whatsapp';
import { playCutePopSound, playSparkleSound, playCameraShutterSound } from '../utils/audioAlert';
import QRISDisplayCard from './QRISDisplayCard';
import PolaroidModal from './PolaroidModal';
import { getQRISConfig } from '../utils/paymentSettings';
import { compressImageFile } from '../utils/imageCompressor';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';
import {
  RotateCcw,
  MessageCircle,
  Copy,
  Check,
  CheckCircle2,
  Camera,
  Sparkles,
  Upload,
  ExternalLink,
} from 'lucide-react';

export default function TicketView() {
  const { currentTicket, orderQueue, startQuiz, attachPaymentProof } = useOrder();
  const [copied, setCopied] = useState(false);
  const [hasClickedPaid, setHasClickedPaid] = useState(false);
  const [isPolaroidOpen, setIsPolaroidOpen] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const qrisConfig = getQRISConfig();

  const handleCopyLink = () => {
    if (!currentTicket) return;
    playCutePopSound();
    const url = `${window.location.origin}/?track=${encodeURIComponent(currentTicket.orderId.replace('#', ''))}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentTicket) return;

    try {
      setIsUploadingProof(true);
      const compressedBase64 = await compressImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.75,
      });
      playSparkleSound();
      if (attachPaymentProof) {
        attachPaymentProof(currentTicket.orderId, compressedBase64);
      }
    } catch (err) {
      console.error('Failed to compress proof image:', err);
      alert('Gagal memproses gambar. Mohon pilih foto lain.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  if (!currentTicket) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm font-semibold text-icechoco-600">Belum ada pesanan aktif.</p>
        <button
          onClick={startQuiz}
          className="px-6 py-3 rounded-2xl bg-rose-500 text-white font-fredoka font-bold text-sm"
        >
          Mulai Quiz Sekarang
        </button>
      </div>
    );
  }

  // Get live updated status from queue if available
  const ticket = orderQueue.find(o => o.orderId === currentTicket.orderId) || currentTicket;

  // Calculate position in queue
  const activeOrders = orderQueue.filter(o => o.status === 'pending' || o.status === 'diproses');
  const myQueueIndex = activeOrders.findIndex(o => o.orderId === ticket.orderId);
  const aheadCount = myQueueIndex >= 0 ? myQueueIndex : 0;

  const servingObj = SERVING_OPTIONS.find(s => s.id === ticket.serving);
  const toppingNames = (ticket.toppings || [])
    .map(topId => {
      const top = TOPPINGS.find(t => t.id === topId);
      return top ? `${top.icon} ${top.name}` : null;
    })
    .filter(Boolean);

  const isReady = ticket.status === 'selesai';
  const isProcessing = ticket.status === 'diproses';

  return (
    <div className="w-full pb-16 pt-2 space-y-4 animate-fade-in">
      {/* Clean Top Header */}
      <div className="text-center space-y-1.5 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-700">
          <span className={`w-2 h-2 rounded-full ${
            isReady ? 'bg-emerald-500' : isProcessing ? 'bg-blue-500' : 'bg-amber-500'
          }`} />
          <span>{isReady ? 'Siap Diambil' : isProcessing ? 'Sedang Disiapkan' : 'Pesanan Tercatat'}</span>
        </div>
        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold text-[#2C1810] leading-tight">
          {isReady ? 'Pesanan Siap Diambil' : isProcessing ? 'Sedang Disiapkan' : 'E-Ticket Pre-Order'}
        </h1>
      </div>

      {/* Unified Modern E-Ticket Card (Apple Wallet / Boarding Pass Style) */}
      <div className="relative mx-auto w-full max-w-md bg-white rounded-3xl border border-stone-300/90 overflow-hidden">
        {/* Ticket Top Header */}
        <div className={`p-5 text-white text-center space-y-2 relative ${
          isReady
            ? 'bg-emerald-700'
            : isProcessing
            ? 'bg-stone-800'
            : 'bg-[#2C1810]'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest opacity-80">
            <span>GABINTANG5</span>
            <span>PRE-ORDER</span>
          </div>

          <div className="font-fredoka font-extrabold text-3xl sm:text-4xl tracking-wider py-0.5">
            {ticket.orderId}
          </div>

          {/* Integrated 3-Step Progress Pill inside E-Ticket */}
          <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-2.5 space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-white" />
                <p className="text-[10px] font-bold text-center text-white">1. Kasir</p>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${
                  isProcessing || isReady ? 'bg-white' : 'bg-white/30'
                }`} />
                <p className={`text-[10px] font-bold text-center ${
                  isProcessing || isReady ? 'text-white' : 'text-white/60'
                }`}>2. Produksi</p>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${
                  isReady ? 'bg-white' : 'bg-white/30'
                }`} />
                <p className={`text-[10px] font-bold text-center ${
                  isReady ? 'text-white' : 'text-white/60'
                }`}>3. Siap!</p>
              </div>
            </div>
            {!isReady && aheadCount > 0 && (
              <p className="text-[10px] text-white/90 font-medium">
                Ada {aheadCount} pesanan aktif sebelum nomor kamu
              </p>
            )}
          </div>
        </div>

        {/* Perforated Ticket Cutout Divider */}
        <div className="relative flex items-center justify-between bg-white">
          <div className="w-5 h-5 rounded-full bg-cream-100 -ml-2.5 border-r border-stone-200" />
          <div className="flex-1 border-t-2 border-dashed border-stone-200 mx-2" />
          <div className="w-5 h-5 rounded-full bg-cream-100 -mr-2.5 border-l border-stone-200" />
        </div>

        {/* Ticket Details Body */}
        <div className="p-5 space-y-4">
          {/* Customer & Schedule Info */}
          <div className="grid grid-cols-2 gap-2 text-xs pb-3.5 border-b border-stone-100">
            <div>
              <span className="text-icechoco-500 block text-[10px] font-medium">Nama Pemesan</span>
              <span className="font-bold text-icechoco-900 text-sm">{ticket.customerName}</span>
            </div>
            <div className="text-right">
              <span className="text-icechoco-500 block text-[10px] font-medium">
                {ticket.orderType === 'po' ? 'Hari Penerimaan PO' : 'Waktu Pesan'}
              </span>
              <span className="font-bold text-rose-600 text-sm">
                {ticket.orderType === 'po' ? (ticket.poSessionName || 'Senin / Selasa') : formatTime(ticket.timestamp)}
              </span>
            </div>
          </div>

          {/* Pre-Order Schedule Pill (Clean Integrated) */}
          {ticket.orderType === 'po' && (
            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                  Jadwal Pre-Order
                </span>
                <span className="font-bold text-icechoco-900">
                  Diproduksi Sabtu &bull; Diterima {ticket.poSessionName || 'Senin / Selasa'}
                </span>
              </div>
              <span className="text-lg">🗓️</span>
            </div>
          )}

          {/* Ordered Menu Item */}
          <div className="p-3.5 rounded-2xl bg-cream-50/80 border border-stone-200/70 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-2xs border border-stone-100">
              {ticket.flavor.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-fredoka font-bold text-sm text-icechoco-900">
                {ticket.secondFlavor
                  ? `${ticket.flavor.name} + ${ticket.secondFlavor.name}`
                  : ticket.flavor.name}
              </h3>
              <p className="text-[11px] text-icechoco-600 font-medium">
                {servingObj?.name || 'Gabin Original'}
              </p>
            </div>
            <span className="font-fredoka font-bold text-sm text-icechoco-900">
              {formatRupiah(ticket.totalPrice)}
            </span>
          </div>

          {/* Selected Toppings */}
          {toppingNames.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-icechoco-500 text-[10px] uppercase tracking-wider block">
                Topping Pilihan
              </span>
              <div className="flex flex-wrap gap-1.5">
                {toppingNames.map((name, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-stone-50 border border-stone-200/80 text-icechoco-800 font-semibold text-[11px]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Special Notes if any */}
          {ticket.notes && (
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900">
              <span className="font-bold">Catatan: </span>
              <span>{ticket.notes}</span>
            </div>
          )}

          {/* Payment Section (QRIS or Cash) */}
          <div className="pt-2">
            {ticket.paymentMethod === 'cash' ? (
              ticket.paymentStatus === 'paid' ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-fredoka font-bold text-xs text-emerald-900">
                    Pembayaran Tunai Lunas!
                  </h4>
                  <p className="text-[10px] text-emerald-700">
                    Uang tunai telah diterima oleh kasir booth.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-2xl block">💵</span>
                    <h4 className="font-fredoka font-bold text-xs text-amber-900">
                      Pembayaran Tunai di Meja Kasir
                    </h4>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      Tunjukkan kupon ini ke kasir dan siapkan uang pas{' '}
                      <span className="font-bold text-rose-600">{formatRupiah(ticket.totalPrice)}</span>.
                    </p>
                  </div>

                  {/* Kirim Konfirmasi Pesanan Tunai ke WhatsApp Admin Button */}
                  <a
                    href={`https://wa.me/${normalizeWhatsAppNumber(qrisConfig?.adminWhatsapp || '081223997778')}?text=${encodeURIComponent(
                      `Halooo Kak Admin GABINTANG5 yang manis! 🥪🍦✨\n\nAku baru aja pesan Gabin Es Krim nomor antrean ${ticket.orderId} atas nama ${ticket.customerName} (${ ticket.flavor?.name || 'Gabin' }${toppingNames.length > 0 ? ` + Topping: ${toppingNames.join(', ')}` : ''}) dengan total ${formatRupiah(ticket.totalPrice)}${ticket.orderType === 'po' ? ` (Sesi: ${ticket.poSessionName || 'PO'})` : ''}.\n\nPembayarannya TUNAI di kasir yaa Kak! Mohon disiapkan, makasih banyak yaa 🥰💖`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-fredoka font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Kabari Admin via WhatsApp</span>
                  </a>
                </div>
              )
            ) : (
              ticket.paymentStatus === 'paid' ? (
                <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-1.5">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-fredoka font-bold text-sm text-emerald-900">
                    Pembayaran QRIS Berhasil!
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Transaksi lunas. Barista sedang meracik Gabin Es Krim pesananmu!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <QRISDisplayCard
                    amount={ticket.totalPrice}
                    orderCode={ticket.orderId}
                  />

                  {/* Bukti Transfer Section */}
                  {ticket.proofImageUrl ? (
                    <div className="p-3.5 rounded-2xl bg-purple-50/90 border-2 border-purple-200 space-y-2.5 shadow-2xs animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-fredoka font-bold text-xs text-purple-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Bukti Transfer Terlampir</span>
                        </span>
                        <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          {ticket.paymentStatus === 'paid' ? 'LUNAS' : 'MENUNGGU VERIFIKASI'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={ticket.proofImageUrl}
                          alt="Bukti Transfer"
                          onClick={() => {
                            const newWin = window.open();
                            newWin?.document.write(`<img src="${ticket.proofImageUrl}" style="max-width:100%; height:auto;" />`);
                          }}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-purple-300 shadow-xs cursor-pointer hover:opacity-90 active:scale-95 transition-all shrink-0"
                          title="Klik untuk melihat foto bukti transfer ukuran penuh"
                        />
                        <div className="flex-1 text-[11px] text-purple-900 space-y-1">
                          <p className="font-semibold leading-snug">
                            Foto bukti transfer tersimpan dan siap diverifikasi barista.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              const newWin = window.open();
                              newWin?.document.write(`<img src="${ticket.proofImageUrl}" style="max-width:100%; height:auto;" />`);
                            }}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Lihat Foto Penuh</span>
                          </button>
                        </div>
                      </div>

                      {/* Kirim Bukti ke WhatsApp Admin Button */}
                      <a
                        href={`https://wa.me/${normalizeWhatsAppNumber(qrisConfig?.adminWhatsapp || '081223997778')}?text=${encodeURIComponent(
                          `Halooo Kak Admin GABINTANG5 yang manis! 🥪🍦✨\n\nAku udah bayar via QRIS nih buat pesanan ${ticket.orderId} atas nama ${ticket.customerName} sebesar ${formatRupiah(ticket.totalPrice)}${ticket.orderType === 'po' ? ` (Sesi: ${ticket.poSessionName || 'PO'})` : ''}.\n\nTolong dicek ya Kak, udah nggak sabar pengen nyobain gabin es krimnya yang renyah dan lumer! Makasih banyak yaa 🥰💖`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-fredoka font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>Kirim Bukti ke WhatsApp Admin Booth</span>
                      </a>

                      {ticket.paymentStatus !== 'paid' && (
                        <div className="pt-0.5 text-center">
                          <label className="text-[10px] text-purple-700 hover:text-purple-900 underline font-bold cursor-pointer">
                            <span>Ganti / Unggah Ulang Foto Bukti</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProofUpload}
                              disabled={isUploadingProof}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Prompt upload if not yet attached
                    <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>Unggah Foto Bukti Transfer</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        Lampirkan foto screenshot transfer QRIS agar kasir dapat memverifikasi pesananmu lebih cepat.
                      </p>
                      <label className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-fredoka font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                        <Camera className="w-4 h-4" />
                        <span>{isUploadingProof ? 'Mengompres Foto...' : 'Pilih Foto Bukti Transfer'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProofUpload}
                          disabled={isUploadingProof}
                        />
                      </label>

                      {/* Tombol langsung chat WA Admin meskipun belum upload bukti */}
                      <a
                        href={`https://wa.me/${normalizeWhatsAppNumber(qrisConfig?.adminWhatsapp || '081223997778')}?text=${encodeURIComponent(
                          `Halooo Kak Admin GABINTANG5 yang manis! 🥪🍦✨\n\nAku udah pesan via QRIS nih buat pesanan ${ticket.orderId} atas nama ${ticket.customerName} (${ticket.flavor?.name || 'Gabin'}${toppingNames.length > 0 ? ` + Topping: ${toppingNames.join(', ')}` : ''}) sebesar ${formatRupiah(ticket.totalPrice)}${ticket.orderType === 'po' ? ` (Sesi: ${ticket.poSessionName || 'PO'})` : ''}.\n\nBukti transfernya aku kirim di chat ini yaa Kak! Makasih banyak 🥰💖`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-fredoka font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>Kirim Bukti Langsung via WhatsApp Admin</span>
                      </a>
                    </div>
                  )}

                  {hasClickedPaid ? (
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center text-xs text-blue-900 font-semibold space-y-0.5 animate-fade-in">
                      <p className="flex items-center justify-center gap-1">
                        <span>⏳</span> Sedang Dicek Kasir
                      </p>
                      <p className="text-[10px] text-blue-700 font-normal">
                        Kasir sedang memverifikasi pembayaranmu di antrean kasir.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        playSparkleSound();
                        setHasClickedPaid(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-fredoka font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Saya Sudah Bayar via QRIS</span>
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {/* Customer WhatsApp Notification Status */}
          {ticket.customerPhone && (
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-[11px] text-emerald-800">Notifikasi WA Aktif</p>
                  <p className="text-[10px] text-emerald-600">{ticket.customerPhone}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                Siap dikabari
              </span>
            </div>
          )}

          {/* Grand Total Bar */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
            <span className="text-xs font-bold text-icechoco-700">Total Pembayaran</span>
            <span className="font-fredoka text-lg font-extrabold text-icechoco-900">
              {formatRupiah(currentTicket.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Navigation Buttons */}
      <div className="space-y-2.5 max-w-md mx-auto pt-1">
        {/* Cetak Foto Polaroid Estetik Si Gabin */}
        <button
          type="button"
          onClick={() => {
            playCameraShutterSound();
            setIsPolaroidOpen(true);
          }}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-rose-50/50 text-icechoco-900 font-fredoka font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 border border-stone-200/90"
        >
          <Camera className="w-4 h-4 text-rose-500" />
          <span>Unduh Kartu Polaroid Pesanan</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        </button>

        {/* Share & Self-Tracking Tools */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={createCustomerShareTicketUrl(ticket)}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-fredoka font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            title="Simpan atau bagikan tiket ke WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Simpan ke WA</span>
          </a>

          <button
            onClick={handleCopyLink}
            className="py-2.5 px-3 rounded-2xl bg-white border border-stone-200/90 hover:border-rose-300 text-icechoco-800 font-fredoka font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            title="Salin link untuk melacak pesanan dari HP lain"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-rose-500" />
                <span>Salin Link</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#2C1810] hover:bg-[#3F2419] text-[#FAF6F0] font-fredoka font-semibold text-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Buat Pesanan Baru</span>
        </button>
      </div>

      {/* Aesthetic Polaroid Modal */}
      <PolaroidModal
        isOpen={isPolaroidOpen}
        onClose={() => setIsPolaroidOpen(false)}
        ticket={ticket}
      />
    </div>
  );
}

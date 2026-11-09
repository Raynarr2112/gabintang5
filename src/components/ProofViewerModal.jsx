import React from 'react';
import { formatRupiah, formatTime } from '../utils/formatters';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';
import { X, CheckCircle2, ExternalLink, MessageCircle, AlertCircle } from 'lucide-react';
import { playSparkleSound, playCutePopSound } from '../utils/audioAlert';

export default function ProofViewerModal({ isOpen, onClose, order, onVerifyPaid }) {
  if (!isOpen || !order) return null;

  const isPaid = order.paymentStatus === 'paid';
  const hasProof = Boolean(order.proofImageUrl);

  const handleVerify = () => {
    playSparkleSound();
    if (onVerifyPaid) {
      onVerifyPaid(order.orderId);
    }
  };

  const handleClose = () => {
    playCutePopSound();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-cream-200 overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-icechoco-900 to-icechoco-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧾</span>
            <div>
              <h3 className="font-fredoka font-bold text-base leading-tight">
                Bukti Transfer &amp; Pembayaran
              </h3>
              <p className="text-[11px] text-cream-200 font-medium">
                Pesanan {order.orderId} &bull; {order.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Order Summary Strip */}
          <div className="p-3 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-icechoco-600 block">Total Tagihan:</span>
              <span className="font-fredoka font-black text-rose-600 text-base">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-icechoco-600 block">Status Pembayaran:</span>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" /> LUNAS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 text-[11px] animate-pulse">
                  <AlertCircle className="w-3 h-3" /> BELUM DIVERIFIKASI
                </span>
              )}
            </div>
          </div>

          {/* PO Details if applicable */}
          {order.orderType === 'po' && (
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-600 block font-bold uppercase tracking-wider">
                  Sesi Pre-Order:
                </span>
                <span className="font-fredoka font-bold text-purple-900">
                  {order.poSessionName || 'Sesi Terjadwal'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-purple-700">
                🕒 {order.poTimeRange || 'Hari-H Event'}
              </span>
            </div>
          )}

          {/* Proof Screenshot Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-fredoka font-bold text-xs text-icechoco-900 flex items-center gap-1.5">
                <span>📸</span>
                <span>Foto Screenshot Transfer:</span>
              </span>
              {hasProof && (
                <a
                  href={order.proofImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Buka Foto Penuh</span>
                </a>
              )}
            </div>

            {hasProof ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-cream-300 bg-cream-100 flex items-center justify-center group shadow-inner">
                <img
                  src={order.proofImageUrl}
                  alt={`Bukti Transfer ${order.orderId}`}
                  className="w-full max-h-[360px] object-contain cursor-zoom-in transition-transform duration-200 hover:scale-105"
                  onClick={() => {
                    const newWin = window.open();
                    newWin?.document.write(`<img src="${order.proofImageUrl}" style="max-width:100%; height:auto;" />`);
                  }}
                  title="Klik untuk membuka ukuran penuh"
                />
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 text-center space-y-1">
                <span className="text-3xl block">⚠️</span>
                <p className="font-fredoka font-bold text-xs text-icechoco-700">
                  Belum ada foto bukti transfer terlampir.
                </p>
                <p className="text-[10px] text-icechoco-500">
                  Pembeli mungkin membayar tunai di meja kasir.
                </p>
              </div>
            )}
          </div>

          {/* Customer WhatsApp Contact */}
          {order.customerPhone && (
            <a
              href={`https://wa.me/${normalizeWhatsAppNumber(order.customerPhone)}?text=${encodeURIComponent(
                `Halo Kak ${order.customerName}, terima kasih telah memesan di GABINTANG5 (${order.orderId}). Kami sudah menerima konfirmasi pembayaran Kakak yaa!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat WhatsApp Pembeli ({order.customerPhone})</span>
            </a>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-cream-50 border-t border-cream-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-2xl border border-cream-300 text-icechoco-700 hover:bg-cream-100 font-fredoka font-bold text-xs transition-colors"
          >
            Tutup
          </button>

          {!isPaid && (
            <button
              type="button"
              onClick={handleVerify}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-fredoka font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verifikasi Lunas ✓</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

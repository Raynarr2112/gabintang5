import React, { useState, useRef } from 'react';
import { useOrder } from '../context/OrderContext';
import { TOPPINGS, SIZE_OPTIONS, SERVING_OPTIONS } from '../data/flavors';
import { formatRupiah } from '../utils/formatters';
import { playCutePopSound, playSparkleSound } from '../utils/audioAlert';
import { compressImageFile } from '../utils/imageCompressor';
import { getQRISConfig } from '../utils/paymentSettings';
import QRISDisplayCard from './QRISDisplayCard';
import {
  X,
  User,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  Sparkles,
  Camera,
  Trash2,
  MessageCircle,
} from 'lucide-react';

export default function OrderModal() {
  const {
    isOrderModalOpen,
    setIsOrderModalOpen,
    recommendedFlavor,
    customization,
    calculateTotal,
    placeOrder,
    poSettings,
    orderQueue,
    calculateSlotRemainingQuota,
  } = useOrder();

  const isBoothOpen = poSettings?.isBoothActive !== false;
  const isPoOpen = poSettings?.isPoActive !== false;

  const [orderType, setOrderType] = useState(() => (isBoothOpen ? 'regular' : 'po'));
  const [selectedSessionId, setSelectedSessionId] = useState(
    () => poSettings?.sessions?.[0]?.id || 'hari-senin'
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris'); // 'qris' | 'cash'
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState(null); // compressed base64 data url
  const [isCompressingProof, setIsCompressingProof] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const qrisConfig = getQRISConfig();
  const adminPhone = qrisConfig.adminWhatsapp || '081223997778';

  if (!isOrderModalOpen) return null;

  const effectiveOrderType =
    orderType === 'regular' && !isBoothOpen
      ? 'po'
      : orderType === 'po' && !isPoOpen
      ? 'regular'
      : orderType;

  const sizeObj = SIZE_OPTIONS.find(s => s.id === customization.size) || SIZE_OPTIONS[0];
  const selectedToppingObjs = customization.toppings
    .map(topId => TOPPINGS.find(t => t.id === topId))
    .filter(Boolean);

  const grandTotal = calculateTotal();

  const activeSession = (poSettings?.sessions || []).find(s => s.id === selectedSessionId) || poSettings?.sessions?.[0];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingProof(true);
      setError('');
      playCutePopSound();
      const compressed = await compressImageFile(file, 800, 0.75);
      setProofImage(compressed);
    } catch (err) {
      setError(err.message || 'Gagal memproses foto bukti.');
    } finally {
      setIsCompressingProof(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Mohon masukkan nama pembuat pesanan ya!');
      return;
    }

    if (effectiveOrderType === 'po') {
      const remaining = calculateSlotRemainingQuota(selectedSessionId, orderQueue, poSettings);
      if (remaining <= 0) {
        setError('Yah, kuota untuk hari ini sudah penuh! Silakan pilih hari lainnya.');
        return;
      }

      if (paymentMethod === 'qris' && !proofImage) {
        setError('Wajib mengunggah foto / screenshot bukti transfer QRIS untuk mengunci pesanan PO kamu!');
        return;
      }
    }

    playSparkleSound();
    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder({
        customerName,
        customerPhone,
        paymentMethod,
        notes,
        orderType: effectiveOrderType,
        poSessionId: effectiveOrderType === 'po' ? (activeSession?.id || 'hari-senin') : null,
        poSessionName: effectiveOrderType === 'po' ? (activeSession?.name || 'Hari Senin') : '',
        poTimeRange: effectiveOrderType === 'po' ? (activeSession?.timeRange || 'Pengambilan / Pengiriman Hari Senin') : '',
        proofImageUrl: paymentMethod === 'qris' ? proofImage : null,
      });
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-icechoco-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-4xl sm:rounded-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-2 border-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF6F0]">
          <div>
            <h3 className="font-fredoka text-lg sm:text-xl font-bold text-[#2C1810]">
              Konfirmasi Pesanan
            </h3>
            <p className="text-xs text-stone-500">
              Pilih metode pengambilan &amp; lengkapi detail pemesan
            </p>
          </div>
          <button
            onClick={() => setIsOrderModalOpen(false)}
            className="p-2 rounded-xl bg-white border border-stone-300 text-stone-600 hover:text-[#2C1810] active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Order Itemized Summary Card */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-stone-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-stone-200 flex items-center justify-center">
                <span
                  className="w-5 h-5 rounded-full border border-black/10"
                  style={{ backgroundColor: recommendedFlavor.color?.accent || '#684535' }}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-fredoka font-bold text-sm text-[#2C1810]">
                  Gabin {recommendedFlavor.name}
                </h4>
                <p className="text-xs text-stone-500">
                  {sizeObj.name}
                </p>
              </div>
              <span className="font-fredoka font-bold text-sm text-[#2C1810]">
                {formatRupiah(sizeObj.price)}
              </span>
            </div>

            {/* Toppings list */}
            {selectedToppingObjs.length > 0 && (
              <div className="pt-2 border-t border-stone-200/80 space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-500 block">
                  Topping Tambahan:
                </span>
                {selectedToppingObjs.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-xs text-stone-700 pl-1">
                    <span>{t.name}</span>
                    <span className="font-semibold text-[#2C1810]">+{formatRupiah(t.price)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total Price Row */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-fredoka font-bold text-base text-[#2C1810]">
              <span>Total Pembayaran</span>
              <span className="text-[#C83E4D] text-lg">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          {/* Customer Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hybrid Mode Selector: Beli Langsung di Booth vs Pre-Order (PO) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C1810] flex items-center justify-between">
                <span>Metode Pengambilan Pesanan:</span>
                <span className="text-[10px] text-stone-500 font-normal">
                  Ambil sekarang atau ikut jadwal PO
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Option 1: Beli Langsung di Booth */}
                <button
                  type="button"
                  disabled={!isBoothOpen}
                  onClick={() => {
                    playCutePopSound();
                    setOrderType('regular');
                    if (error) setError('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    effectiveOrderType === 'regular'
                      ? 'bg-[#2C1810] text-white border-[#2C1810] shadow-xs'
                      : !isBoothOpen
                      ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed text-stone-500'
                      : 'bg-white border-stone-300 hover:border-[#2C1810] text-[#2C1810]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-fredoka font-bold text-xs flex items-center gap-1">
                      <span>⚡</span>
                      <span>Beli di Booth</span>
                    </span>
                    {!isBoothOpen ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">
                        Tutup
                      </span>
                    ) : (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        effectiveOrderType === 'regular'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        Buka
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] leading-snug ${
                    effectiveOrderType === 'regular' ? 'text-stone-300' : 'text-stone-500'
                  }`}>
                    {isBoothOpen
                      ? 'Langsung dibuat & ambil sekarang di kasir'
                      : 'Booth sedang tutup, silakan pilih Pre-Order'}
                  </p>
                </button>

                {/* Option 2: Pre-Order (PO) */}
                <button
                  type="button"
                  disabled={!isPoOpen}
                  onClick={() => {
                    playCutePopSound();
                    setOrderType('po');
                    if (error) setError('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    effectiveOrderType === 'po'
                      ? 'bg-[#2C1810] text-white border-[#2C1810] shadow-xs'
                      : !isPoOpen
                      ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed text-stone-500'
                      : 'bg-white border-stone-300 hover:border-[#2C1810] text-[#2C1810]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-fredoka font-bold text-xs flex items-center gap-1">
                      <span>📅</span>
                      <span>Pre-Order (PO)</span>
                    </span>
                    {!isPoOpen ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">
                        Tutup
                      </span>
                    ) : (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        effectiveOrderType === 'po'
                          ? 'bg-[#C83E4D] text-white'
                          : 'bg-rose-50 text-[#C83E4D] border border-rose-200'
                      }`}>
                        Senin/Selasa
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] leading-snug ${
                    effectiveOrderType === 'po' ? 'text-stone-300' : 'text-stone-500'
                  }`}>
                    {isPoOpen
                      ? 'Produksi Sabtu, siap Senin / Selasa'
                      : 'Sesi Pre-Order sedang ditutup'}
                  </p>
                </button>
              </div>
            </div>

            {/* Conditional Sub-Panel: Booth Live Info OR Pre-Order Day Picker */}
            {effectiveOrderType === 'regular' ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-fredoka font-bold text-emerald-950 block">
                    ⚡ Antrean Langsung di Booth
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Pesananmu langsung masuk ke layar barista saat ini juga.
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-emerald-800 border border-emerald-200 shrink-0">
                  Ambil Sekarang
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-fredoka font-bold text-xs text-[#2C1810]">
                    Pilih Hari Penerimaan PO:
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500">
                    Produksi Hari Sabtu
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(poSettings?.sessions || []).map(session => {
                    const remaining = calculateSlotRemainingQuota(session.id, orderQueue, poSettings);
                    const isFull = remaining <= 0;
                    const isSelected = selectedSessionId === session.id;

                    return (
                      <button
                        key={session.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => {
                          playCutePopSound();
                          setSelectedSessionId(session.id);
                        }}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? 'bg-white border-[#2C1810] ring-1 ring-[#2C1810]'
                            : isFull
                            ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
                            : 'bg-white border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div>
                          <span className="font-fredoka font-bold text-xs text-[#2C1810] block">
                            {session.name}
                          </span>
                          <span className="text-[10px] text-stone-500 block mt-0.5">
                            Siap diantar / diambil
                          </span>
                        </div>

                        <div className="text-right shrink-0 ml-1">
                          {isFull ? (
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-md">
                              Penuh
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Sisa {remaining}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customer Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-icechoco-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span>Nama Pemesan <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => {
                  setCustomerName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Contoh: Rian / Siska"
                className={`w-full px-4 py-3 rounded-2xl border-2 text-sm bg-white font-medium placeholder:text-gray-400 focus:outline-none transition-all ${
                  error ? 'border-rose-400 bg-rose-50/50' : 'border-cream-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                }`}
                autoFocus
              />
              {error && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
            </div>

            {/* Customer WhatsApp Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-icechoco-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>No. WhatsApp <span className="text-[11px] font-normal text-icechoco-500">(Opsional)</span></span>
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                  💬 Info saat es krim siap
                </span>
              </div>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full px-4 py-3 rounded-2xl border-2 border-cream-300 text-sm bg-white font-medium placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
              <p className="text-[11px] text-icechoco-500 pl-1">
                Barista akan mengirimkan pesan WhatsApp saat es krim selesai dibuat.
              </p>
            </div>

            {/* Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-icechoco-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Catatan Khusus Barista (Opsional)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Misal: Jangan pakai sendok plastik / topping dipisah..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-cream-300 text-sm bg-white font-medium placeholder:text-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all resize-none"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-icechoco-900 flex items-center justify-between">
                <span>Metode Pembayaran:</span>
                <span className="text-[10px] text-icechoco-500 font-normal">
                  Pilih QRIS atau Tunai
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playCutePopSound();
                    setPaymentMethod('qris');
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between ${
                    paymentMethod === 'qris'
                      ? 'border-[#DF2826] bg-rose-50/70 shadow-xs ring-2 ring-rose-200'
                      : 'border-cream-300 bg-white hover:border-cream-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-[#DF2826] text-xs flex items-center gap-1">
                      <span>QRIS</span>
                      <span className="text-[9px] px-1 py-0.2 bg-[#DF2826] text-white rounded font-bold">Instan</span>
                    </span>
                    {paymentMethod === 'qris' && <CheckCircle2 className="w-3.5 h-3.5 text-[#DF2826]" />}
                  </div>
                  <p className="text-[10px] text-icechoco-600 font-medium leading-tight">
                    Scan via BCA, GoPay, Shopee, DANA
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playCutePopSound();
                    setPaymentMethod('cash');
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between ${
                    paymentMethod === 'cash'
                      ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-200'
                      : 'border-cream-300 bg-white hover:border-cream-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-amber-800 text-xs">💵 Tunai</span>
                    {paymentMethod === 'cash' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <p className="text-[10px] text-icechoco-600 font-medium leading-tight">
                    Bayar uang pas / tunai saat terima
                  </p>
                </button>
              </div>

              {paymentMethod === 'qris' ? (
                <div className="space-y-3 p-3.5 rounded-3xl bg-rose-50/90 border-2 border-rose-300 shadow-xs mt-2">
                  {/* Step 1: Scan QRIS */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-fredoka font-bold text-xs text-rose-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">
                          1
                        </span>
                        <span>Scan &amp; Bayar QRIS Instan</span>
                      </span>
                      <span className="text-xs font-black text-[#DF2826] bg-white px-2 py-0.5 rounded-full border border-rose-200">
                        {formatRupiah(grandTotal)}
                      </span>
                    </div>

                    <div className="max-w-[280px] mx-auto pt-1">
                      <QRISDisplayCard
                        amount={grandTotal}
                        orderCode={effectiveOrderType === 'po' ? 'PRE-ORDER' : 'BOOTH'}
                      />
                    </div>
                  </div>

                  {/* Step 2: Upload Proof Screenshot (MANDATORY for QRIS PO, Optional/Recommended for Booth) */}
                  <div className="space-y-1.5 pt-2 border-t border-rose-200">
                    <div className="flex items-center justify-between">
                      <label className="font-fredoka font-bold text-xs text-rose-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">
                          2
                        </span>
                        <span>
                          Upload Screenshot Bukti Transfer{' '}
                          {effectiveOrderType === 'po' && <span className="text-rose-600">*</span>}
                        </span>
                      </label>
                      <span className="text-[10px] font-black text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-full">
                        {effectiveOrderType === 'po' ? 'Wajib QRIS PO' : 'Opsional di Booth'}
                      </span>
                    </div>

                    {proofImage ? (
                      <div className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <img
                            src={proofImage}
                            alt="Bukti Transfer"
                            className="w-14 h-14 object-cover rounded-xl border border-emerald-400 shadow-xs"
                          />
                          <div>
                            <span className="font-fredoka font-bold text-xs text-emerald-900 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Bukti Siap Dikirim!</span>
                            </span>
                            <p className="text-[10px] text-emerald-700 font-medium">
                              Foto bukti transfer QRIS berhasil diunggah.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            playCutePopSound();
                            setProofImage(null);
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-90 transition-all text-xs font-bold flex items-center gap-1 shrink-0"
                          title="Ganti Foto Bukti"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Ganti</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-1.5 active:scale-98 ${
                          error && !proofImage
                            ? 'bg-rose-100/70 border-rose-500 text-rose-800'
                            : 'bg-white hover:bg-cream-50 border-rose-300 text-icechoco-700'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl shadow-xs border border-rose-200">
                          {isCompressingProof ? '⏳' : '📸'}
                        </div>
                        <div>
                          <p className="font-fredoka font-bold text-xs text-rose-900">
                            {isCompressingProof
                              ? 'Mengompres Foto...'
                              : 'Klik untuk Unggah Screenshot Transfer QRIS'}
                          </p>
                          <p className="text-[10px] text-icechoco-500">
                            Ambil langsung dari Kamera HP atau Galeri Foto
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Optional WhatsApp Confirmation */}
                    <div className="pt-1">
                      <a
                        href={`https://wa.me/${adminPhone.replace(/^0/, '62')}?text=${encodeURIComponent(
                          effectiveOrderType === 'po'
                            ? `Halooo Kak Admin GABINTANG5 yang manis!\n\nAku mau konfirmasi Pre-Order (PO) atas nama ${customerName || 'Pembeli'} sebesar ${formatRupiah(grandTotal)} untuk penerimaan ${activeSession?.name || 'Senin / Selasa'}. Mohon dicek yaa Kak, makasih banyak!`
                            : `Halooo Kak Admin GABINTANG5 yang manis!\n\nAku mau konfirmasi pesanan Beli Langsung di Booth atas nama ${customerName || 'Pembeli'} sebesar ${formatRupiah(grandTotal)}. Mohon disiapkan yaa Kak, makasih banyak!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kirim Konfirmasi via WhatsApp Admin</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl border text-xs space-y-0.5 mt-1.5 bg-amber-50/80 border-amber-200 text-amber-900">
                  <p className="font-bold flex items-center gap-1">
                    <span>💡</span>
                    <span>
                      {effectiveOrderType === 'po'
                        ? 'Pembayaran Tunai (COD / Saat Terima)'
                        : 'Pembayaran Tunai Langsung di Kasir Booth'}
                    </span>
                  </p>
                  <p className="text-[11px] opacity-90">
                    {effectiveOrderType === 'po'
                      ? `Siapkan uang pas saat pesanan diberikan pada ${activeSession?.name || 'Hari Senin / Selasa'}.`
                      : `Tunjukkan E-Ticket ke kasir booth dan bayar ${formatRupiah(grandTotal)}.`}
                  </p>
                </div>
              )}
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-[#2C1810] hover:bg-[#3F2419] text-[#FAF6F0] font-fredoka font-semibold text-base active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Menyiapkan E-Ticket Pesanan...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {effectiveOrderType === 'po'
                      ? paymentMethod === 'qris' && !proofImage
                        ? `Upload Bukti & Pesan PO (${formatRupiah(grandTotal)})`
                        : `Pesan PO ${activeSession?.name || ''} (${formatRupiah(grandTotal)})`
                      : `Pesan & Ambil di Booth (${formatRupiah(grandTotal)})`}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

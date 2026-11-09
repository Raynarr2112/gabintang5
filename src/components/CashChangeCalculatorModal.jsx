import React, { useState } from 'react';
import { formatRupiah } from '../utils/formatters';
import { X, Banknote, CheckCircle2 } from 'lucide-react';

export default function CashChangeCalculatorModal({ isOpen, onClose, order, onConfirmPaid }) {
  const [cashGiven, setCashGiven] = useState(0);

  if (!isOpen || !order) return null;

  const total = order.totalPrice || 0;
  const change = Math.max(0, cashGiven - total);
  const isSufficient = cashGiven >= total;

  // Preset quick cash buttons
  const presets = [
    { label: 'Uang Pas', value: total },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
  ].filter(p => p.value >= total || p.label === 'Uang Pas');

  const handleConfirm = () => {
    onConfirmPaid(order.orderId, 'cash', cashGiven, change);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-icechoco-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-4xl p-5 shadow-2xl border-2 border-cream-200 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-fredoka font-bold text-base text-icechoco-900 leading-tight">
                Pembayaran Tunai Kasir
              </h3>
              <p className="text-[11px] text-icechoco-600">
                {order.orderId} &bull; {order.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-icechoco-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bill Amount */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900">Total Tagihan:</span>
          <span className="font-fredoka text-xl font-bold text-amber-900">
            {formatRupiah(total)}
          </span>
        </div>

        {/* Quick Amount Buttons */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-icechoco-700 block">
            Pilih Uang Diterima dari Pembeli:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCashGiven(p.value)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                  cashGiven === p.value
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-cream-50 hover:bg-cream-100 text-icechoco-800 border-cream-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Cash Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-icechoco-600 block">
            Atau Ketik Nominal Lain:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">Rp</span>
            <input
              type="number"
              value={cashGiven || ''}
              onChange={e => setCashGiven(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-cream-300 text-sm font-bold text-icechoco-900 focus:outline-none focus:border-rose-400"
            />
          </div>
        </div>

        {/* Change Display */}
        <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
          !isSufficient && cashGiven > 0
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div>
            <span className="text-[11px] font-bold block uppercase tracking-wider">
              Kembalian:
            </span>
            <span className="font-fredoka text-2xl font-bold">
              {isSufficient ? formatRupiah(change) : 'Uang Kurang!'}
            </span>
          </div>
          {isSufficient && (
            <div className="text-right text-[11px] font-semibold text-emerald-700">
              {change === 0 ? '✨ Uang Pas' : 'Kembalikan ke Pembeli'}
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isSufficient}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-fredoka font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Konfirmasi Lunas & Mulai Buat</span>
        </button>
      </div>
    </div>
  );
}

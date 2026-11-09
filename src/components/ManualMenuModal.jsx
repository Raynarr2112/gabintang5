import React from 'react';
import { FLAVORS } from '../data/flavors';
import { X, Check, Sparkles, ArrowRight, Ban } from 'lucide-react';

export default function ManualMenuModal({
  isOpen,
  onClose,
  selectedFlavorId,
  onSelectFlavor,
  soldOutFlavors = [],
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-icechoco-950/65 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-4xl p-5 shadow-2xl border-2 border-cream-200 max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 shrink-0">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mb-0.5">
              <Sparkles className="w-3 h-3" />
              Katalog Lengkap Booth
            </span>
            <h2 className="font-fredoka text-lg sm:text-xl font-bold text-icechoco-900">
              Pilih Menu Favoritmu Sendiri 🍧
            </h2>
            <p className="text-xs text-icechoco-600 font-medium">
              Merasa hasil kuis kurang pas? Bebas pilih varian rasa kesukaanmu di bawah ini:
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-icechoco-500 hover:text-icechoco-900 hover:bg-cream-100 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flavor List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {FLAVORS.map((flavor) => {
            const isCurrent = flavor.id === selectedFlavorId;
            const isSoldOut = soldOutFlavors.includes(flavor.id);

            return (
              <div
                key={flavor.id}
                onClick={() => {
                  if (!isSoldOut) onSelectFlavor(flavor);
                }}
                className={`p-3.5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSoldOut
                    ? 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-rose-50/90 border-rose-500 shadow-md ring-2 ring-rose-200 cursor-pointer active:scale-[0.98]'
                    : 'bg-white border-cream-200 hover:border-rose-300 hover:bg-cream-50/50 shadow-xs cursor-pointer active:scale-[0.98]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-2xl shadow-inner shrink-0 mt-0.5">
                    {flavor.emoji}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-fredoka font-bold text-sm sm:text-base text-icechoco-900">
                        {flavor.name}
                      </h3>
                      {isSoldOut ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-0.5">
                          <Ban className="w-3 h-3" /> Habis (Sold Out)
                        </span>
                      ) : isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3 stroke-[3]" /> Terpilih
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-icechoco-600 leading-tight">
                      {flavor.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-md">
                        {flavor.moodMatch}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSoldOut}
                  className={`w-full sm:w-auto px-4 py-2 rounded-2xl font-fredoka font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs ${
                    isSoldOut
                      ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                      : isCurrent
                      ? 'bg-rose-500 text-white'
                      : 'bg-cream-100 hover:bg-rose-500 hover:text-white text-icechoco-800'
                  }`}
                >
                  <span>{isSoldOut ? 'Stok Habis' : isCurrent ? 'Sedang Dipilih' : 'Pilih Menu Ini'}</span>
                  {!isCurrent && !isSoldOut && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-cream-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-icechoco-600 hover:bg-cream-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

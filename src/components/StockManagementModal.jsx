import React from 'react';
import { useOrder } from '../context/OrderContext';
import { FLAVORS, TOPPINGS } from '../data/flavors';
import { X, Check, Ban, PackageCheck, AlertTriangle } from 'lucide-react';

export default function StockManagementModal({ isOpen, onClose }) {
  const {
    soldOutFlavors = [],
    soldOutToppings = [],
    toggleFlavorSoldOut,
    toggleToppingSoldOut,
  } = useOrder();

  if (!isOpen) return null;

  const totalSoldOut = soldOutFlavors.length + soldOutToppings.length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl border-2 border-cream-200 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-cream-200 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
                <PackageCheck className="w-4 h-4" />
              </span>
              <h2 className="font-fredoka text-lg sm:text-xl font-bold text-icechoco-900">
                Kelola Stok & Status Menu 📦
              </h2>
            </div>
            <p className="text-xs text-icechoco-600 font-medium mt-0.5">
              Menu yang ditandai <span className="text-rose-600 font-bold">Habis</span> otomatis tidak bisa dipesan di kiosk pelanggan.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-icechoco-500 hover:text-icechoco-900 hover:bg-cream-100 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 no-scrollbar">
          {/* Section 1: Flavors */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-fredoka font-bold text-sm text-icechoco-900 flex items-center gap-1.5">
                <span>🍦</span>
                <span>Varian Rasa Es Krim</span>
              </h3>
              <span className="text-[11px] text-icechoco-600 font-semibold">
                {FLAVORS.length - soldOutFlavors.length} / {FLAVORS.length} Tersedia
              </span>
            </div>

            <div className="space-y-2">
              {FLAVORS.map(flavor => {
                const isSoldOut = soldOutFlavors.includes(flavor.id);

                return (
                  <div
                    key={flavor.id}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isSoldOut
                        ? 'bg-rose-50/60 border-rose-300'
                        : 'bg-white border-cream-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{flavor.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-fredoka font-bold text-xs sm:text-sm text-icechoco-900">
                            {flavor.name}
                          </h4>
                          {isSoldOut && (
                            <span className="px-2 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                              Habis
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-icechoco-500">
                          {flavor.tagline}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFlavorSoldOut(flavor.id)}
                      className={`px-3 py-1.5 rounded-xl font-fredoka font-bold text-xs transition-all active:scale-95 flex items-center gap-1 shadow-xs ${
                        isSoldOut
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isSoldOut ? (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          <span>Habis</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Tersedia</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Toppings */}
          <div className="space-y-3.5 pt-2 border-t border-cream-200">
            <div className="flex items-center justify-between">
              <h3 className="font-fredoka font-bold text-sm text-icechoco-900 flex items-center gap-1.5">
                <span>🍪</span>
                <span>Varian Topping (Tabur, Buah &amp; Selai)</span>
              </h3>
              <span className="text-[11px] text-icechoco-600 font-semibold">
                {TOPPINGS.length - soldOutToppings.length} / {TOPPINGS.length} Tersedia
              </span>
            </div>

            {[
              { key: 'tabur', label: 'Topping Tabur' },
              { key: 'buah', label: 'Topping Buah' },
              { key: 'selai', label: 'Topping Selai' },
            ].map(group => (
              <div key={group.key} className="space-y-2">
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200 inline-block">
                  {group.label}
                </span>
                {TOPPINGS.filter(t => t.category === group.key).map(topping => {
                  const isSoldOut = soldOutToppings.includes(topping.id);

                  return (
                    <div
                      key={topping.id}
                      className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        isSoldOut
                          ? 'bg-rose-50/60 border-rose-300'
                          : 'bg-white border-cream-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{topping.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-fredoka font-bold text-xs sm:text-sm text-icechoco-900">
                              {topping.name}
                            </h4>
                            {isSoldOut && (
                              <span className="px-2 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                                Habis
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleToppingSoldOut(topping.id)}
                        className={`px-3 py-1.5 rounded-xl font-fredoka font-bold text-xs transition-all active:scale-95 flex items-center gap-1 shadow-xs ${
                          isSoldOut
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {isSoldOut ? (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            <span>Habis</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Tersedia</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-cream-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-icechoco-600 font-medium">
            {totalSoldOut > 0 ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {totalSoldOut} menu ditandai habis
              </span>
            ) : (
              'Semua menu tersedia'
            )}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-icechoco-900 hover:bg-icechoco-800 text-cream-100 font-fredoka font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Simpan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

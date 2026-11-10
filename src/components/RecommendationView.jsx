import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { TOPPINGS } from '../data/flavors';
import { formatRupiah } from '../utils/formatters';
import { playCutePopSound, playSparkleSound } from '../utils/audioAlert';
import FlavorIllustration from './FlavorIllustration';
import ManualMenuModal from './ManualMenuModal';
import { Sparkles, RotateCcw, Check, ShoppingBag, ChevronDown, ArrowRight } from 'lucide-react';

export default function RecommendationView() {
  const {
    recommendedFlavor,
    setRecommendedFlavor,
    customization,
    setCustomization,
    calculateTotal,
    startQuiz,
    setIsOrderModalOpen,
    soldOutFlavors,
    soldOutToppings,
  } = useOrder();

  const [isManualMenuOpen, setIsManualMenuOpen] = useState(false);
  const [isManualPick, setIsManualPick] = useState(false);

  const isRecommendedSoldOut = soldOutFlavors?.includes(recommendedFlavor.id);
  const currentTotal = calculateTotal();
  const selectedToppingObjects = TOPPINGS.filter(t => customization.toppings.includes(t.id));

  // Topping checkbox toggle
  const handleToggleTopping = (toppingId) => {
    if (soldOutToppings?.includes(toppingId)) return;
    playCutePopSound();
    setCustomization(prev => {
      const exists = prev.toppings.includes(toppingId);
      const updated = exists
        ? prev.toppings.filter(id => id !== toppingId)
        : [...prev.toppings, toppingId];
      return { ...prev, toppings: updated };
    });
  };

  const handleManualFlavorSelect = (flavor) => {
    setRecommendedFlavor(flavor);
    setIsManualPick(true);
    setIsManualMenuOpen(false);
  };

  return (
    <div className="w-full pb-36 pt-4 lg:pt-8 space-y-6 animate-fade-in">
      {/* Top Banner Result Announcement */}
      <div className="text-center space-y-1.5 px-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#C83E4D] block">
          {isManualPick ? 'Pilihan Varian Menu' : 'Rekomendasi Racikan Rasa'}
        </span>
        <h1 className="font-fredoka text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1810] leading-tight">
          Gabin {recommendedFlavor.name}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          {isManualPick
            ? 'Varian es krim pilihanmu yang disajikan dengan biskuit gabin renyah.'
            : 'Kombinasi es krim & topping yang dirancang sesuai jawaban mood kamu.'}
        </p>
      </div>

      {/* Responsive Split Layout on Laptop: Left Sticky Flavor Card | Right Topping Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols on Desktop): Sticky Main Bento Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="relative rounded-3xl bg-white border border-stone-300/80 p-5 sm:p-6 space-y-4 overflow-hidden">
            {/* Top Row: Mood Badge & Switch Flavor Button */}
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                  style={{ backgroundColor: recommendedFlavor.color.accent }}
                />
                <span className="text-xs font-semibold text-stone-700">
                  {recommendedFlavor.tagline}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsManualMenuOpen(true)}
                className="text-xs font-semibold text-[#2C1810] hover:bg-stone-100 bg-[#FAF6F0] px-3 py-1.5 rounded-full border border-stone-300 flex items-center gap-1 transition-colors"
              >
                <span>Ganti Rasa</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sold Out Warning Banner */}
            {isRecommendedSoldOut && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-rose-900">
                    Varian Ini Sedang Habis
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Silakan pilih varian rasa lain yang tersedia.
                  </p>
                </div>
                <button
                  onClick={() => setIsManualMenuOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#2C1810] text-white font-fredoka font-semibold text-xs shrink-0 transition-all"
                >
                  Pilih Rasa
                </button>
              </div>
            )}

            {/* Dynamic Interactive Illustration */}
            <div
              className="rounded-2xl py-3 flex flex-col items-center justify-center"
              style={{ backgroundColor: recommendedFlavor.color.light }}
            >
              <FlavorIllustration
                flavorId={recommendedFlavor.id}
                serving={customization.serving}
                size={customization.size}
                toppings={customization.toppings}
                className="w-48 h-52"
              />
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {recommendedFlavor.description}
            </p>

            {/* Clean 2x2 Bento Summary of Current Combination */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-medium block">Varian Utama</span>
                <span className="font-bold text-[#2C1810]">Gabin {recommendedFlavor.name}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-medium block">Topping Tabur</span>
                <span className="font-bold text-[#2C1810]">
                  {TOPPINGS.filter(t => t.category === 'tabur' && customization.toppings.includes(t.id))
                    .map(t => t.name)
                    .join(', ') || 'Tanpa Tabur'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-medium block">Topping Buah</span>
                <span className="font-bold text-[#2C1810]">
                  {TOPPINGS.filter(t => t.category === 'buah' && customization.toppings.includes(t.id))
                    .map(t => t.name)
                    .join(', ') || 'Tanpa Buah'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-medium block">Topping Selai</span>
                <span className="font-bold text-[#2C1810]">
                  {TOPPINGS.filter(t => t.category === 'selai' && customization.toppings.includes(t.id))
                    .map(t => t.name)
                    .join(', ') || 'Tanpa Selai'}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Action: Repeat Quiz */}
          <div className="text-center">
            <button
              onClick={startQuiz}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#2C1810] py-2 px-4 rounded-full bg-white border border-stone-300/80 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi Kuis Mood</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 cols on Desktop): Customization Section */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-stone-300/80 space-y-5">
          {/* Base Price Row */}
          <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-stone-200 flex items-center justify-between">
            <div>
              <h4 className="font-fredoka font-bold text-xs sm:text-sm text-[#2C1810]">
                Gabin Original + Es Krim {recommendedFlavor.name}
              </h4>
              <p className="text-[11px] text-stone-500">
                Harga porsi standar sebelum tambahan topping
              </p>
            </div>
            <span className="font-fredoka font-bold text-sm sm:text-base text-[#2C1810]">
              {formatRupiah(9000)}
            </span>
          </div>

          {/* Toppings Header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <h3 className="font-fredoka font-bold text-sm sm:text-base text-[#2C1810]">
                Pilihan Topping Tambahan
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500">
                Pilih sesuai selera atau biarkan sesuai rekomendasi
              </p>
            </div>
            {customization.toppings.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  playCutePopSound();
                  setCustomization(prev => ({ ...prev, toppings: [] }));
                }}
                className="text-[11px] font-semibold text-stone-600 hover:text-[#2C1810] bg-[#FAF6F0] px-3 py-1 rounded-full border border-stone-300 transition-colors"
              >
                Hapus Semua Topping
              </button>
            )}
          </div>

          {/* Grouped Toppings (2 columns per group on Tablet/Laptop) */}
          <div className="space-y-4">
            {[
              { key: 'tabur', label: 'Topping Tabur', priceText: '+Rp 2.000' },
              { key: 'buah', label: 'Topping Buah', priceText: '+Rp 3.000' },
              { key: 'selai', label: 'Topping Selai', priceText: '+Rp 1.000' },
            ].map(group => {
              const groupToppings = TOPPINGS.filter(t => t.category === group.key);
              return (
                <div key={group.key} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-[#2C1810]">
                      {group.label}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-600 bg-[#FAF6F0] px-2.5 py-0.5 rounded-md border border-stone-200">
                      {group.priceText}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {groupToppings.map(topping => {
                      const isSoldOut = soldOutToppings?.includes(topping.id);
                      const isChecked = customization.toppings.includes(topping.id);
                      return (
                        <div
                          key={topping.id}
                          onClick={() => {
                            if (!isSoldOut) handleToggleTopping(topping.id);
                          }}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                            isSoldOut
                              ? 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
                              : isChecked
                              ? 'bg-[#FAF6F0] border-[#2C1810] ring-1 ring-[#2C1810] cursor-pointer active:scale-[0.99]'
                              : 'bg-white border-stone-200 hover:border-stone-400 cursor-pointer active:scale-[0.99]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{topping.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-fredoka font-bold text-xs sm:text-sm text-[#2C1810]">
                                  {topping.name}
                                </h4>
                                {isSoldOut && (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                    Habis
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-medium text-stone-500">
                                +{formatRupiah(topping.price)}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                              isSoldOut
                                ? 'border-stone-300 bg-stone-100'
                                : isChecked
                                ? 'bg-[#2C1810] border-[#2C1810] text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {!isSoldOut && isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern Floating Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/90 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto p-3.5 sm:px-5 rounded-2xl bg-white border border-stone-300 shadow-xl pointer-events-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-fredoka text-lg font-bold text-[#2C1810]">
                {formatRupiah(currentTotal)}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF6F0] text-stone-700 border border-stone-200">
                {selectedToppingObjects.length > 0
                  ? `${selectedToppingObjects.length} Topping`
                  : 'Tanpa Topping'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 truncate">
              Gabin {recommendedFlavor.name}
              {selectedToppingObjects.length > 0
                ? ` + ${selectedToppingObjects.map(t => t.name).join(', ')}`
                : ''}
            </p>
          </div>

          <button
            disabled={isRecommendedSoldOut}
            onClick={() => {
              if (!isRecommendedSoldOut) {
                playSparkleSound();
                setIsOrderModalOpen(true);
              }
            }}
            className={`py-3 px-6 rounded-xl font-fredoka font-semibold text-sm flex items-center justify-center gap-2 shrink-0 transition-all ${
              isRecommendedSoldOut
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-[#2C1810] hover:bg-[#3F2419] text-[#FAF6F0] active:scale-95'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isRecommendedSoldOut ? 'Stok Habis' : 'Lanjut Pesan Sekarang'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Catalog Modal for choosing flavor manually */}
      <ManualMenuModal
        isOpen={isManualMenuOpen}
        onClose={() => setIsManualMenuOpen(false)}
        selectedFlavorId={recommendedFlavor.id}
        onSelectFlavor={handleManualFlavorSelect}
        soldOutFlavors={soldOutFlavors}
      />
    </div>
  );
}

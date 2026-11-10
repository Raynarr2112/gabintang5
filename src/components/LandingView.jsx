import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { FLAVORS } from '../data/flavors';
import FlavorIllustration from './FlavorIllustration';
import { ArrowRight, Calendar } from 'lucide-react';

export default function LandingView() {
  const { startQuiz, poSettings } = useOrder();
  const [previewFlavorId, setPreviewFlavorId] = useState('coklat');
  const activePreviewFlavor = FLAVORS.find(f => f.id === previewFlavorId) || FLAVORS[2];

  return (
    <div className="w-full pb-16 pt-6 lg:pt-10 space-y-12 animate-fade-in">
      {/* Responsive Desktop Split Hero: Left Editorial Copy & PO Schedule | Right Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column (7 cols on Desktop): Editorial Typography, PO Schedule, & 3 Steps */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Minimalist Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/70 text-stone-700 text-[11px] font-semibold uppercase tracking-widest">
            <span>Freshly Handcrafted &bull; Batch Mingguan</span>
          </div>

          {/* Editorial Hero Header (No Neon Gradient, Clean Solid Colors) */}
          <div className="space-y-3">
            <h1 className="font-fredoka text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C1810] tracking-tight leading-[1.15]">
              Sandwich Biskuit Gabin &amp; Es Krim Lembut,{' '}
              <span className="text-[#C83E4D] underline decoration-[#E8C5B0] decoration-4 underline-offset-4">
                Diracik Sesuai Mood.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Perpaduan renyahnya biskuit gabin klasik dengan es krim padat yang lembut. Jawab 6 pertanyaan singkat untuk menemukan racikan rasa dan topping yang paling pas buat harimu.
            </p>
          </div>

          {/* Clean Editorial Booth & Pre-Order Status Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-300/80 space-y-3 max-w-xl mx-auto lg:mx-0">
            <div className="flex flex-wrap items-center gap-2">
              {poSettings?.isBoothActive !== false ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>⚡ Beli Langsung di Booth: Buka</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-stone-100 text-stone-600 border border-stone-200 font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                  <span>Booth Tutup (Khusus PO)</span>
                </span>
              )}

              {poSettings?.isPoActive !== false && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-rose-50 text-[#C83E4D] border border-rose-200 font-bold px-2.5 py-1 rounded-full">
                  <Calendar className="w-3 h-3" />
                  <span>Open Pre-Order (Senin / Selasa)</span>
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 text-left leading-relaxed">
              {poSettings?.isBoothActive !== false
                ? <>Bisa <strong className="text-stone-800">pesan &amp; ambil langsung di kasir Booth</strong> sekarang, atau ikut <strong className="text-stone-800">Pre-Order Mingguan</strong> (Produksi Sabtu &bull; Ready Senin / Selasa).</>
                : <>Pemesanan Pre-Order <strong className="text-stone-800">Rabu – Jumat</strong> &bull; Produksi <strong className="text-stone-800">Sabtu</strong> &bull; Pengantaran <strong className="text-stone-800">Senin / Selasa</strong>.</>}
            </p>
          </div>

          {/* Primary CTA & Minimalist Steps */}
          <div className="pt-1 space-y-6 max-w-xl mx-auto lg:mx-0">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={startQuiz}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2C1810] hover:bg-[#3F2419] active:scale-[0.99] text-[#FAF6F0] font-fredoka font-semibold text-base tracking-wide transition-all flex items-center justify-center gap-2.5 group"
              >
                <span>Mulai Temukan Rasa &amp; Pesan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <span className="text-xs font-medium text-stone-500">
                Harga mulai <strong className="text-[#2C1810]">Rp 9.000</strong> / porsi
              </span>
            </div>

            {/* Clean 3-Step Editorial Row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-200/90 text-left">
              <div>
                <span className="text-[11px] font-bold text-[#C83E4D] tracking-wider uppercase block">
                  Langkah 01
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#2C1810] mt-0.5">Jawab 6 Pertanyaan</p>
                <p className="text-[11px] text-stone-500">Kenali mood &amp; selera hari ini</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#C83E4D] tracking-wider uppercase block">
                  Langkah 02
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#2C1810] mt-0.5">Atur Topping</p>
                <p className="text-[11px] text-stone-500">Taburan, potongan buah &amp; selai</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#C83E4D] tracking-wider uppercase block">
                  Langkah 03
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#2C1810] mt-0.5">Ambil di Booth / PO</p>
                <p className="text-[11px] text-stone-500">Bisa langsung ambil atau PO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols on Desktop): Clean Studio Product Showcase Card */}
        <div className="lg:col-span-5">
          <div className="mx-auto w-full max-w-md rounded-3xl bg-white border border-stone-300/80 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">
                  Preview Menu
                </span>
                <h3 className="font-fredoka font-bold text-base text-[#2C1810]">
                  Gabin {activePreviewFlavor.name}
                </h3>
              </div>
              <span className="text-xs font-bold text-[#2C1810] bg-[#FAF6F0] px-3 py-1 rounded-full border border-stone-200">
                Rp 9.000
              </span>
            </div>

            {/* Central Illustration on Clean Cream Pedestal */}
            <div
              className="rounded-2xl py-4 flex flex-col items-center justify-center transition-colors duration-300"
              style={{ backgroundColor: activePreviewFlavor.color.light }}
            >
              <FlavorIllustration
                flavorId={activePreviewFlavor.id}
                serving="gabin-original"
                size="single"
                toppings={['keju', 'oreo', 'selai-caramel']}
                className="w-48 h-52"
              />
            </div>

            {/* Interactive Color Swatch Selector to Preview Flavors */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500 font-medium">
                <span className="shrink-0">Pilih varian:</span>
                <span className="text-stone-800 font-semibold text-right truncate">
                  {activePreviewFlavor.tagline}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {FLAVORS.map(flavor => {
                  const isActive = flavor.id === activePreviewFlavor.id;
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => setPreviewFlavorId(flavor.id)}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'border-[#2C1810] bg-[#2C1810] text-white'
                          : 'border-stone-200 bg-[#FAF6F0]/60 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: flavor.color.accent }}
                      />
                      <span className="text-[11px]">{flavor.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Menu Catalog Section */}
      <div className="space-y-5 pt-6 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C83E4D] block">
              Katalog Varian Rasa
            </span>
            <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-[#2C1810]">
              5 Varian Es Krim Artisan
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Disajikan di antara dua keping biskuit gabin renyah.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FLAVORS.map(flavor => (
            <div
              key={flavor.id}
              onClick={startQuiz}
              className="group p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#2C1810] cursor-pointer transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: flavor.color.accent }}
                    />
                    <h3 className="font-fredoka font-bold text-base text-[#2C1810]">
                      {flavor.name}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#2C1810] bg-[#FAF6F0] px-2.5 py-1 rounded-md border border-stone-200 shrink-0">
                    Rp 9.000
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                  {flavor.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <span className="text-stone-500 font-medium truncate">
                  {flavor.notes.slice(0, 2).join(' • ')}
                </span>
                <span className="font-semibold text-[#2C1810] group-hover:translate-x-0.5 transition-transform shrink-0">
                  Mulai Kuis &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

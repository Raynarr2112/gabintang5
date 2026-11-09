import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { Home, Search } from 'lucide-react';
import TrackOrderModal from './TrackOrderModal';

/**
 * Navbar — Customer variant
 * Menampilkan brand GABINTANG5 dan tombol Lacak Pesanan untuk pembeli.
 */
export default function Navbar() {
  const { currentView, setCurrentView } = useOrder();
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 py-3.5 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Brand / Logo */}
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 group text-left transition-transform active:scale-95"
          >
            <img
              src="/logo-gabintang5.jpg"
              alt="Logo GABINTANG5"
              className="w-10 h-10 rounded-full object-cover border border-stone-300 bg-white"
            />
            <div>
              <div className="font-fredoka font-bold text-base sm:text-lg leading-tight text-icechoco-900 tracking-tight">
                GABINTANG5
              </div>
              <span className="text-[11px] font-medium text-stone-500 block">
                Artisan Gabin Ice Cream
              </span>
            </div>
          </button>

          {/* Navigation Controls — Track Order & Home */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="px-3.5 py-2 rounded-full bg-white border border-stone-300/90 text-icechoco-800 hover:border-icechoco-800 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1.5"
              title="Lacak status antrean pesanan kamu"
            >
              <Search className="w-3.5 h-3.5 text-icechoco-700" />
              <span>Lacak Pesanan</span>
            </button>

            {currentView !== 'landing' && (
              <button
                onClick={() => setCurrentView('landing')}
                className="p-2 rounded-full bg-white border border-stone-300/90 text-icechoco-700 hover:border-icechoco-800 active:scale-95 transition-all text-xs font-semibold flex items-center"
                title="Kembali ke Beranda"
              >
                <Home className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />
    </>
  );
}

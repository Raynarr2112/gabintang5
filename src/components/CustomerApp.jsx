import React, { useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import Navbar from './Navbar';
import LandingView from './LandingView';
import QuizView from './QuizView';
import RecommendationView from './RecommendationView';
import TicketView from './TicketView';
import OrderModal from './OrderModal';

/**
 * CustomerApp — Layout khusus untuk device pelanggan
 * Mendukung URL ?track=SCOOP-XXX untuk pelacakan langsung dari WhatsApp
 */
export default function CustomerApp() {
  const { currentView, setCurrentView, setCurrentTicket, orderQueue } = useOrder();

  // Auto-track order if URL contains ?track=SCOOP-XXX
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const trackCode = params.get('track');
    if (trackCode && orderQueue.length > 0) {
      const cleanCode = trackCode.trim().toUpperCase();
      const matched = orderQueue.find(o => {
        const id = o.orderId.toUpperCase();
        return id === cleanCode || id === `#${cleanCode}` || id.endsWith(cleanCode);
      });
      if (matched) {
        setCurrentTicket(matched);
        setCurrentView('ticket');
      }
    }
  }, [orderQueue, setCurrentTicket, setCurrentView]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-icechoco-900 flex flex-col items-center relative overflow-x-hidden">
      {/* Customer Navbar */}
      <Navbar variant="customer" />

      {/* Main Responsive Application Container (Mobile-First + Wide Desktop Split) */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
        {currentView === 'landing' && <LandingView />}
        {currentView === 'quiz' && <QuizView />}
        {currentView === 'recommendation' && <RecommendationView />}
        {currentView === 'ticket' && <TicketView variant="customer" />}
      </main>

      {/* Order Summary & Customer Name Modal */}
      <OrderModal />

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-icechoco-600 border-t border-cream-200/80 bg-white/40 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-fredoka font-semibold text-icechoco-800 flex items-center justify-center gap-2">
            <img src="/logo-gabintang5.jpg" alt="GABINTANG5" className="w-5 h-5 rounded-full object-cover border border-rose-200" />
            <span>GABINTANG5 &bull; Gabin Ice Cream Artisan</span>
          </div>
          <p className="text-[11px] text-icechoco-500">
            Open PO Rabu – Jumat &bull; Produksi Sabtu &bull; Ready Senin / Selasa
          </p>
        </div>
      </footer>
    </div>
  );
}

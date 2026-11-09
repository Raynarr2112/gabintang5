import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';
import { Search, X, AlertCircle, Ticket } from 'lucide-react';

export default function TrackOrderModal({ isOpen, onClose }) {
  const { orderQueue, setCurrentTicket, setCurrentView } = useOrder();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanQuery = query.trim().toUpperCase();

    if (!cleanQuery) {
      setError('Masukkan nomor antrean atau nomor HP kamu.');
      return;
    }

    // Cari berdasarkan orderId (e.g. #SCOOP-108 atau 108) atau customerPhone
    const matched = orderQueue.find(order => {
      const normalizedId = order.orderId.toUpperCase();
      const rawNumber = normalizedId.replace(/\D/g, '');
      const queryNumber = cleanQuery.replace(/\D/g, '');

      // Match #SCOOP-XXX or partial number (e.g. 108)
      if (normalizedId === cleanQuery || normalizedId === `#${cleanQuery}`) return true;
      if (queryNumber && (rawNumber === queryNumber || normalizedId.endsWith(cleanQuery))) return true;

      // Match WhatsApp Phone
      if (order.customerPhone) {
        const orderPhone = normalizeWhatsAppNumber(order.customerPhone);
        const inputPhone = normalizeWhatsAppNumber(query);
        if (orderPhone && inputPhone && orderPhone.includes(inputPhone)) return true;
      }

      return false;
    });

    if (matched) {
      setCurrentTicket(matched);
      setCurrentView('ticket');
      setError('');
      onClose();
    } else {
      setError(`Pesanan "${query}" tidak ditemukan. Pastikan nomor antrean sudah benar.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-icechoco-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-4xl p-5 shadow-2xl border-2 border-white space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-fredoka font-bold text-base text-icechoco-900 leading-tight">
                Lacak Status Pesanan
              </h3>
              <p className="text-[11px] text-icechoco-500">
                Cek antrean Gabin Es Krim kamu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-icechoco-600 active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-icechoco-800 block">
              Nomor Antrean / No. WhatsApp:
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Misal: SCOOP-108 atau 0812..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-cream-300 text-sm font-medium focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            {error && (
              <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-fredoka font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Cek Status Antrean</span>
          </button>
        </form>

        {/* Quick Help */}
        <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 text-[11px] text-icechoco-600 space-y-1">
          <p className="font-bold text-icechoco-800 flex items-center gap-1">
            <span>💡</span> Info Bantuan
          </p>
          <p>
            Nomor antrean tercetak di kupon saat kamu memesan (contoh: <span className="font-bold text-rose-600">#SCOOP-001</span>).
          </p>
        </div>
      </div>
    </div>
  );
}

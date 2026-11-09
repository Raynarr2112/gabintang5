import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import BaristaQueueView from './BaristaQueueView';
import AdminPinGate, { clearAdminSession, changeAdminPin } from './AdminPinGate';
import { ClipboardList, LogOut, KeyRound } from 'lucide-react';

/**
 * AdminApp — Layout khusus untuk device barista/kasir
 * Dilindungi oleh PIN gate, hanya menampilkan panel antrean & tools admin
 */
export default function AdminApp() {
  return (
    <AdminPinGate>
      <AdminLayout />
    </AdminPinGate>
  );
}

function AdminLayout() {
  const { orderQueue } = useOrder();
  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  const pendingCount = orderQueue.filter(
    (o) => o.status === 'pending' || o.status === 'diproses'
  ).length;

  const handleLogout = () => {
    clearAdminSession();
    window.location.reload();
  };

  const handleChangePin = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinChangeMsg('PIN harus 4 digit angka!');
      return;
    }
    const ok = changeAdminPin(newPin);
    if (ok) {
      setPinChangeMsg('PIN berhasil diubah!');
      setNewPin('');
      setTimeout(() => {
        setPinChangeMsg('');
        setShowPinChange(false);
      }, 1500);
    } else {
      setPinChangeMsg('Gagal menyimpan PIN baru.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 py-3 bg-[#2C1810] border-b border-stone-800 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-gabintang5.jpg"
              alt="Logo GABINTANG5"
              className="w-10 h-10 rounded-full object-cover border border-stone-600 bg-white"
            />
            <div>
              <div className="font-fredoka font-bold text-base sm:text-lg leading-tight text-[#FAF6F0] flex items-center gap-2">
                <span>GABINTANG5</span>
                <span className="px-2 py-0.5 rounded-md bg-[#C83E4D] text-white text-[10px] font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <span className="text-[11px] font-medium text-stone-400 block">
                Dashboard Manajemen Pre-Order
              </span>
            </div>
          </div>

          {/* Admin Controls */}
          <div className="flex items-center gap-2">
            {/* Active orders badge */}
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#C83E4D] text-white text-[11px] font-bold flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{pendingCount} aktif</span>
              </span>
            )}

            {/* Change PIN */}
            <button
              onClick={() => setShowPinChange(!showPinChange)}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-all"
              title="Ubah PIN Admin"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              title="Keluar dari Panel Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* PIN Change Dropdown */}
        {showPinChange && (
          <div className="max-w-6xl mx-auto mt-3 p-3 rounded-2xl bg-stone-900 border border-stone-700 animate-fade-in">
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  if (pinChangeMsg) setPinChangeMsg('');
                }}
                placeholder="PIN baru (4 digit)"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 text-white text-xs font-medium focus:outline-none focus:border-stone-500 placeholder:text-stone-500"
              />
              <button
                onClick={handleChangePin}
                className="px-3.5 py-2 rounded-xl bg-[#C83E4D] hover:bg-rose-700 text-white text-xs font-bold transition-all active:scale-95"
              >
                Simpan PIN
              </button>
            </div>
            {pinChangeMsg && (
              <p className={`text-[11px] font-semibold mt-1.5 ${pinChangeMsg.includes('berhasil') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pinChangeMsg}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Main Admin Content (Responsive Mobile to Wide Laptop Grid) */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
        <BaristaQueueView variant="admin" />
      </main>

      {/* Admin Footer */}
      <footer className="w-full py-5 text-center text-xs text-stone-500 border-t border-stone-200/80 bg-white/50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-fredoka font-semibold text-[#2C1810] flex items-center justify-center gap-2">
            <img src="/logo-gabintang5.jpg" alt="GABINTANG5" className="w-5 h-5 rounded-full object-cover border border-stone-300" />
            <span>GABINTANG5 Admin Panel</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Kelola antrean Pre-Order Senin &amp; Selasa, verifikasi bukti bayar, dan unduh laporan Excel.
          </p>
        </div>
      </footer>
    </div>
  );
}

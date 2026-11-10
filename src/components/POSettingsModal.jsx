import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { DEFAULT_PO_SETTINGS } from '../utils/poSettings';
import { X, Save, RotateCcw, Check } from 'lucide-react';
import { playCutePopSound, playSparkleSound } from '../utils/audioAlert';

export default function POSettingsModal({ isOpen, onClose }) {
  const { poSettings, updatePoSettings } = useOrder();

  const [form, setForm] = useState(() => ({ ...DEFAULT_PO_SETTINGS, ...poSettings }));
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...DEFAULT_PO_SETTINGS, ...poSettings });
    }
  }, [isOpen, poSettings]);

  if (!isOpen) return null;

  const handleToggleActive = () => {
    playCutePopSound();
    setForm(prev => ({ ...prev, isPoActive: !prev.isPoActive }));
  };

  const handleToggleBooth = () => {
    playCutePopSound();
    setForm(prev => ({ ...prev, isBoothActive: !(prev.isBoothActive !== false) }));
  };

  const handleSessionChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.sessions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sessions: updated };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    playSparkleSound();
    updatePoSettings(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    playCutePopSound();
    setForm(DEFAULT_PO_SETTINGS);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-white overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cream-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl shadow-inner">
              🗓️
            </div>
            <div>
              <h3 className="font-fredoka text-lg font-bold text-icechoco-900">
                Pengaturan Jadwal Pre-Order (PO)
              </h3>
              <p className="text-xs text-icechoco-600">
                Open PO Rabu - Jumat &bull; Produksi Sabtu &bull; Ready Senin / Selasa
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCutePopSound();
              onClose();
            }}
            className="p-2 rounded-2xl bg-white border border-cream-300 text-icechoco-600 hover:text-icechoco-900 active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Booth Direct Order Switch */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex items-center justify-between">
            <div>
              <p className="font-fredoka font-bold text-sm text-icechoco-900">
                Status Beli Langsung di Booth
              </p>
              <p className="text-xs text-icechoco-600">
                {form.isBoothActive !== false
                  ? 'Buka — pengunjung di booth bisa pesan & ambil langsung di kasir'
                  : 'Tutup — pilihan Beli Langsung dikunci (Hanya terima PO)'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleBooth}
              className={`w-14 h-8 rounded-full transition-colors relative p-1 shrink-0 ${
                form.isBoothActive !== false ? 'bg-emerald-500' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  form.isBoothActive !== false ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Active Switch */}
          <div className="p-3.5 rounded-2xl bg-cream-100/70 border border-cream-300 flex items-center justify-between">
            <div>
              <p className="font-fredoka font-bold text-sm text-icechoco-900">
                Status Fitur Pre-Order (PO)
              </p>
              <p className="text-xs text-icechoco-600">
                {form.isPoActive
                  ? 'Aktif — konsumen bisa pesan PO & pilih hari Senin / Selasa'
                  : 'Nonaktif — konsumen hanya bisa beli langsung'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`w-14 h-8 rounded-full transition-colors relative p-1 ${
                form.isPoActive ? 'bg-emerald-500' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  form.isPoActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-icechoco-800">Jadwal Open PO</label>
              <input
                type="text"
                value={form.eventName}
                onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
                placeholder="Misal: Open PO Rabu - Jumat"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs font-medium focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-icechoco-800">Info Produksi &amp; Pengantaran</label>
              <input
                type="text"
                value={form.eventDate}
                onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                placeholder="Misal: Produksi Sabtu • Pengantaran Senin / Selasa"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs font-medium focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {/* Sessions & Quotas */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-icechoco-900 uppercase tracking-wider block">
              Pilihan Hari Penerimaan Konsumen (Senin / Selasa) &amp; Kuota:
            </label>

            <div className="space-y-2.5">
              {(form.sessions || DEFAULT_PO_SETTINGS.sessions).map((sess, idx) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-2xl bg-cream-50 border border-cream-300/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-fredoka font-bold text-xs text-rose-600 flex items-center gap-1.5">
                      <span>{sess.icon || '⏰'}</span>
                      <span>Sesi #{idx + 1}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-icechoco-700">Kuota Porsi:</span>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={sess.quota}
                        onChange={e =>
                          handleSessionChange(idx, 'quota', Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-16 px-2 py-1 rounded-lg border border-cream-300 text-xs font-bold text-center bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={sess.name}
                        onChange={e => handleSessionChange(idx, 'name', e.target.value)}
                        placeholder="Nama Sesi (Misal: Siang Segar)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={sess.timeRange}
                        onChange={e => handleSessionChange(idx, 'timeRange', e.target.value)}
                        placeholder="Jam (Misal: 11:00 - 13:00 WIB)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-cream-200">
            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-3.5 rounded-xl border border-cream-300 text-icechoco-700 hover:text-icechoco-900 font-fredoka font-bold text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-fredoka font-bold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pengaturan PO</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { getQRISConfig, saveQRISConfig } from '../utils/paymentSettings';
import QRISDisplayCard from './QRISDisplayCard';
import { X, QrCode, Upload, Save, CheckCircle2, RotateCcw } from 'lucide-react';

export default function QRISSettingsModal({ isOpen, onClose }) {
  const [config, setConfig] = useState(() => getQRISConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getQRISConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG/PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (typeof base64 === 'string') {
        setConfig(prev => ({ ...prev, qrisImageUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveQRISConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToDefault = () => {
    setConfig(prev => ({
      ...prev,
      qrisImageUrl: '/qris-gabintang5.jpg',
      merchantName: 'RESYA STORE - FOOD',
      merchantNmid: 'ID1026557732124',
      adminWhatsapp: '081223997778',
    }));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-cream-200 max-h-[90vh] overflow-y-auto space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-fredoka font-bold text-lg text-icechoco-900 leading-tight">
                Pengaturan QRIS Booth
              </h3>
              <p className="text-xs text-icechoco-600">
                Pasang QRIS toko kamu untuk pembayaran non-tunai pembeli
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-icechoco-500 hover:text-icechoco-900 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Form + Preview */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Form Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-icechoco-800 block">
                  Nama Toko / Merchant:
                </label>
                <input
                  type="text"
                  value={config.merchantName}
                  onChange={e => setConfig(prev => ({ ...prev, merchantName: e.target.value }))}
                  placeholder="Contoh: ScoopMatch Booth"
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-300 text-xs font-medium focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-icechoco-800 block">
                  NMID (Nomor Merchant ID QRIS):
                </label>
                <input
                  type="text"
                  value={config.merchantNmid}
                  onChange={e => setConfig(prev => ({ ...prev, merchantNmid: e.target.value }))}
                  placeholder="Contoh: ID1024354657689"
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-300 text-xs font-medium focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-icechoco-800 block">
                  No. WhatsApp Admin (Terima Bukti Transfer):
                </label>
                <input
                  type="text"
                  value={config.adminWhatsapp || ''}
                  onChange={e => setConfig(prev => ({ ...prev, adminWhatsapp: e.target.value }))}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-300 text-xs font-medium focus:outline-none focus:border-rose-400"
                />
                <span className="text-[10px] text-icechoco-500 block">
                  Nomor WA booth untuk menerima kiriman bukti transfer dari pembeli.
                </span>
              </div>

              {/* Upload QRIS Image */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-icechoco-800 block">
                  Upload Gambar QRIS Merchant:
                </label>
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-rose-300 rounded-2xl bg-rose-50/50 hover:bg-rose-50 cursor-pointer transition-colors text-center">
                  <Upload className="w-5 h-5 text-rose-500 mb-1" />
                  <span className="text-xs font-bold text-rose-700">Pilih Foto QRIS Toko</span>
                  <span className="text-[10px] text-icechoco-500">BCA, GoPay, DANA, dll (PNG / JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {config.qrisImageUrl && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 pt-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Hapus foto custom (Gunakan QRIS Standar)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="space-y-1.5 flex flex-col items-center">
              <span className="text-xs font-bold text-icechoco-600">
                Pratinjau QRIS di Layar Pembeli:
              </span>
              <div className="scale-90 origin-top">
                <QRISDisplayCard amount={22000} orderCode="#SCOOP-001" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-cream-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-icechoco-700 text-xs font-bold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-fredoka font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan QRIS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

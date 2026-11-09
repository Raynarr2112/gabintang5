import React from 'react';
import { formatRupiah } from '../utils/formatters';
import { getQRISConfig } from '../utils/paymentSettings';
import { ShieldCheck } from 'lucide-react';

export default function QRISDisplayCard({ amount = 0, orderCode = '' }) {
  const config = getQRISConfig();

  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-3xl border-2 border-slate-300 shadow-md overflow-hidden text-center select-none font-sans">
      {/* Official QRIS Header */}
      <div className="bg-[#DF2826] text-white pt-2.5 pb-2 px-4 space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-tighter">QRIS</span>
            <span className="text-[9px] font-semibold tracking-wider uppercase opacity-90">
              National Standard
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span>GPN</span>
          </div>
        </div>
        <p className="text-[8px] tracking-widest uppercase opacity-80 text-left">
          Quick Response Code Indonesian Standard
        </p>
      </div>

      {/* Merchant Details */}
      <div className="py-2.5 px-3 border-b border-gray-100 bg-gray-50/60">
        <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide truncate">
          {config.merchantName || 'ScoopMatch - Gabin Es Krim'}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
          <span>NMID: {config.merchantNmid || 'ID1024354657689'}</span>
          <span>A01</span>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="p-3 bg-white flex flex-col items-center justify-center space-y-2">
        {config.qrisImageUrl ? (
          <img
            src={config.qrisImageUrl}
            alt="QRIS RESYA STORE - FOOD"
            className="w-full max-w-[260px] h-auto object-contain rounded-xl border border-gray-200 shadow-xs"
          />
        ) : (
          <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-inner relative">
            {/* High-Resolution Clean Vector QR code */}
            <svg className="w-48 h-48" viewBox="0 0 100 100" fill="black">
              {/* Corner 1 (Top Left) */}
              <rect x="2" y="2" width="28" height="28" rx="4" />
              <rect x="6" y="6" width="20" height="20" fill="white" />
              <rect x="10" y="10" width="12" height="12" />

              {/* Corner 2 (Top Right) */}
              <rect x="70" y="2" width="28" height="28" rx="4" />
              <rect x="74" y="6" width="20" height="20" fill="white" />
              <rect x="78" y="10" width="12" height="12" />

              {/* Corner 3 (Bottom Left) */}
              <rect x="2" y="70" width="28" height="28" rx="4" />
              <rect x="6" y="74" width="20" height="20" fill="white" />
              <rect x="10" y="78" width="12" height="12" />

              {/* Data Blocks & Pattern */}
              <rect x="35" y="6" width="6" height="6" />
              <rect x="45" y="8" width="8" height="4" />
              <rect x="57" y="6" width="8" height="6" />
              <rect x="35" y="16" width="8" height="6" />
              <rect x="49" y="18" width="14" height="6" />
              <rect x="35" y="26" width="6" height="6" />

              <rect x="6" y="35" width="8" height="6" />
              <rect x="18" y="38" width="8" height="8" />
              <rect x="32" y="35" width="10" height="6" />
              <rect x="68" y="35" width="6" height="8" />
              <rect x="78" y="38" width="16" height="6" />

              <rect x="6" y="47" width="14" height="6" />
              <rect x="26" y="47" width="8" height="6" />
              <rect x="68" y="49" width="10" height="6" />
              <rect x="84" y="47" width="10" height="8" />

              <rect x="6" y="59" width="8" height="6" />
              <rect x="20" y="57" width="8" height="8" />
              <rect x="68" y="61" width="8" height="8" />
              <rect x="82" y="59" width="12" height="6" />

              <rect x="35" y="68" width="8" height="8" />
              <rect x="49" y="66" width="12" height="6" />
              <rect x="67" y="74" width="6" height="10" />
              <rect x="77" y="72" width="16" height="6" />
              <rect x="35" y="82" width="10" height="12" />
              <rect x="51" y="78" width="8" height="8" />
              <rect x="65" y="88" width="12" height="6" />
              <rect x="83" y="84" width="10" height="10" />

              {/* Center Logo Badge */}
              <circle cx="50" cy="50" r="12" fill="white" />
              <circle cx="50" cy="50" r="10" fill="#DF2826" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white text-xs font-bold font-fredoka drop-shadow-xs">🍦</span>
            </div>
          </div>
        )}

        {/* Nominal Pas Callout */}
        {amount > 0 && (
          <div className="w-full py-2 px-3 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">
              Nominal Bayar Pas:
            </span>
            <span className="font-fredoka text-lg font-bold text-amber-900">
              {formatRupiah(amount)}
            </span>
            {orderCode && (
              <p className="text-[10px] text-amber-700 mt-0.5">
                Berita/Ref: <span className="font-bold">{orderCode}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Supported Payment Logos & Instructions */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 flex-wrap font-bold text-gray-700">
          <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">BCA</span>
          <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">Mandiri</span>
          <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">BRI</span>
          <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">GoPay</span>
          <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">ShopeePay</span>
          <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">DANA</span>
          <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">OVO</span>
        </div>
        <p className="text-[9px] text-gray-500">
          Bisa discan pakai semua aplikasi m-Banking & e-Wallet di Indonesia
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { formatRupiah, formatTime } from '../utils/formatters';
import { TOPPINGS, SIZE_OPTIONS, SERVING_OPTIONS } from '../data/flavors';
import { exportOrdersToExcel } from '../utils/excelExporter';
import { isSupabaseConfigured } from '../services/supabase';
import { getGoogleSheetsWebhookUrl } from '../services/orderSync';
import SyncSettingsModal from './SyncSettingsModal';
import StockManagementModal from './StockManagementModal';
import QRISSettingsModal from './QRISSettingsModal';
import CashChangeCalculatorModal from './CashChangeCalculatorModal';
import POSettingsModal from './POSettingsModal';
import ProofViewerModal from './ProofViewerModal';
import { isSoundEnabled, setSoundEnabled, playOrderChime } from '../utils/audioAlert';
import { createOrderReadyWhatsAppUrl, normalizeWhatsAppNumber } from '../utils/whatsapp';
import {
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Trash2,
  User,
  FileSpreadsheet,
  TrendingUp,
  Check,
  Settings,
  Database,
  Volume2,
  VolumeX,
  PackageCheck,
  Phone,
  MessageCircle,
  QrCode,
  Banknote,
  Camera,
} from 'lucide-react';

export default function BaristaQueueView() {
  const {
    orderQueue,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    resetToDemoOrders,
    clearQueue,
    soldOutFlavors = [],
    soldOutToppings = [],
  } = useOrder();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'diproses' | 'selesai'
  const [orderTypeFilter, setOrderTypeFilter] = useState('all'); // 'all' | 'regular' | 'po' | 'po-senin' | 'po-selasa'
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [cashOrderToPay, setCashOrderToPay] = useState(null);
  const [selectedProofOrder, setSelectedProofOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playOrderChime();
    }
  };

  const counts = {
    all: orderQueue.length,
    pending: orderQueue.filter(o => o.status === 'pending').length,
    diproses: orderQueue.filter(o => o.status === 'diproses').length,
    selesai: orderQueue.filter(o => o.status === 'selesai').length,
    regular: orderQueue.filter(o => o.orderType !== 'po').length,
    po: orderQueue.filter(o => o.orderType === 'po').length,
    poSenin: orderQueue.filter(
      o => o.orderType === 'po' && (o.poSessionId === 'hari-senin' || (o.poSessionName || '').toLowerCase().includes('senin'))
    ).length,
    poSelasa: orderQueue.filter(
      o => o.orderType === 'po' && (o.poSessionId === 'hari-selasa' || (o.poSessionName || '').toLowerCase().includes('selasa'))
    ).length,
  };

  const totalOmzet = orderQueue.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const isCloudOn = isSupabaseConfigured();
  const isSheetsOn = Boolean(getGoogleSheetsWebhookUrl());

  const filteredOrders = orderQueue.filter(order => {
    const matchesStatus = activeTab === 'all' || order.status === activeTab;
    const isSenin =
      order.orderType === 'po' &&
      (order.poSessionId === 'hari-senin' || (order.poSessionName || '').toLowerCase().includes('senin'));
    const isSelasa =
      order.orderType === 'po' &&
      (order.poSessionId === 'hari-selasa' || (order.poSessionName || '').toLowerCase().includes('selasa'));

    const matchesType =
      orderTypeFilter === 'all' ||
      (orderTypeFilter === 'po' && order.orderType === 'po') ||
      (orderTypeFilter === 'po-senin' && isSenin) ||
      (orderTypeFilter === 'po-selasa' && isSelasa) ||
      (orderTypeFilter === 'regular' && order.orderType !== 'po');
    return matchesStatus && matchesType;
  });

  const handleNextStatus = (order) => {
    if (order.status === 'pending') {
      updateOrderStatus(order.orderId, 'diproses');
    } else if (order.status === 'diproses') {
      updateOrderStatus(order.orderId, 'selesai');
    }
  };

  const handleCompleteAndSendWA = (order) => {
    updateOrderStatus(order.orderId, 'selesai');
    const waUrl = createOrderReadyWhatsAppUrl(order);
    if (waUrl) {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleExportExcel = () => {
    if (orderQueue.length === 0) {
      alert('Belum ada pesanan untuk diekspor!');
      return;
    }
    setIsExporting(true);
    try {
      const ok = exportOrdersToExcel(orderQueue);
      if (ok) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mengekspor laporan: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full pb-16 pt-4 lg:pt-6 space-y-5 animate-fade-in">
      {/* Header Row on Desktop: Title Left, Quick Tool Buttons Right */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-stone-200/80 relative z-20">
        <div className="space-y-0.5">
          <h1 className="font-fredoka text-2xl sm:text-3xl font-bold text-[#2C1810]">
            Antrean Pre-Order
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Kelola pesanan Senin &amp; Selasa, verifikasi pembayaran, dan unduh laporan Excel.
          </p>
        </div>

        {/* Top Bar: Stock Management, Sound Alert & Cloud Sync */}
        <div className="flex flex-wrap items-center gap-2">
          {/* QRIS Merchant Settings Button */}
          <button
            type="button"
            onClick={() => setIsQrisModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-300 bg-white hover:border-[#2C1810] text-[#2C1810] transition-all active:scale-95 cursor-pointer"
            title="Atur Gambar & Akun QRIS Toko"
          >
            <QrCode className="w-3.5 h-3.5 text-[#C83E4D]" />
            <span>QRIS Toko</span>
          </button>

          {/* Pre-Order Event Settings Button */}
          <button
            type="button"
            onClick={() => setIsPoModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-300 bg-white hover:border-[#2C1810] text-[#2C1810] transition-all active:scale-95 cursor-pointer"
            title="Atur Jadwal & Kuota Pre-Order (Senin / Selasa)"
          >
            <span>🗓️</span>
            <span>Atur PO</span>
          </button>

          {/* Stock Management Button */}
          <button
            type="button"
            onClick={() => setIsStockModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-300 bg-white hover:border-[#2C1810] text-[#2C1810] transition-all active:scale-95 cursor-pointer"
            title="Kelola Stok & Status Menu (Habis / Tersedia)"
          >
            <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Kelola Stok</span>
            {(soldOutFlavors.length + soldOutToppings.length) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#C83E4D] text-white text-[9px] font-bold">
                {soldOutFlavors.length + soldOutToppings.length} habis
              </span>
            )}
          </button>

          {/* Sound Alert Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
              soundOn
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-stone-100 border-stone-300 text-stone-500'
            }`}
            title={soundOn ? 'Bel Suara Aktif (Klik untuk mute)' : 'Bel Suara Nonaktif (Klik untuk aktifkan)'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
            <span className="hidden sm:inline">{soundOn ? 'Bel Aktif' : 'Mute'}</span>
          </button>

          {/* Cloud Sync Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
              isCloudOn || isSheetsOn
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white hover:border-[#2C1810] border-stone-300 text-[#2C1810]'
            }`}
            title="Konfigurasi Database Cloud & Google Sheets"
          >
            <Database className={`w-3.5 h-3.5 ${isCloudOn || isSheetsOn ? 'text-emerald-600' : 'text-stone-500'}`} />
            <span>{isCloudOn ? 'Cloud Aktif' : isSheetsOn ? 'Sheets Aktif' : 'Setup Cloud'}</span>
            <Settings className="w-3 h-3 text-stone-400" />
          </button>
        </div>
      </div>

      {/* Modern Bento Stat Cards: Omzet, Rekap PO Senin, Rekap PO Selasa, & Menunggu */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="col-span-2 p-4 sm:p-5 rounded-2xl bg-[#2C1810] text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs text-stone-300 font-medium block">
                Total Omzet ({counts.all} pesanan)
              </span>
              <span className="font-fredoka text-xl sm:text-2xl font-bold text-white tracking-wide">
                {formatRupiah(totalOmzet)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-[#2C1810] font-fredoka font-semibold text-xs transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            title="Download laporan pesanan ke file Excel .xlsx"
          >
            {exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>Terunduh</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isExporting ? '...' : 'Unduh Excel'}</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOrderTypeFilter(orderTypeFilter === 'po-senin' ? 'all' : 'po-senin')}
          className={`p-4 rounded-2xl border text-left transition-all active:scale-[0.99] ${
            orderTypeFilter === 'po-senin'
              ? 'bg-[#C83E4D] text-white border-[#C83E4D]'
              : 'bg-white border-stone-200/90 hover:border-[#2C1810] text-[#2C1810]'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${
            orderTypeFilter === 'po-senin' ? 'text-rose-100' : 'text-stone-500'
          }`}>
            📅 PO Hari Senin
          </span>
          <div className="font-fredoka text-xl sm:text-2xl font-bold mt-1">
            {counts.poSenin} <span className="text-xs font-medium opacity-80">porsi</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setOrderTypeFilter(orderTypeFilter === 'po-selasa' ? 'all' : 'po-selasa')}
          className={`p-4 rounded-2xl border text-left transition-all active:scale-[0.99] ${
            orderTypeFilter === 'po-selasa'
              ? 'bg-[#C83E4D] text-white border-[#C83E4D]'
              : 'bg-white border-stone-200/90 hover:border-[#2C1810] text-[#2C1810]'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${
            orderTypeFilter === 'po-selasa' ? 'text-rose-100' : 'text-stone-500'
          }`}>
            🗓️ PO Hari Selasa
          </span>
          <div className="font-fredoka text-xl sm:text-2xl font-bold mt-1">
            {counts.poSelasa} <span className="text-xs font-medium opacity-80">porsi</span>
          </div>
        </button>
      </div>

      {/* Combined Filter Bar: Status Tabs Left & PO Day Filter Right on Laptop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-stone-200/90 overflow-x-auto no-scrollbar">
          {[
            { key: 'all', label: 'Semua Status' },
            { key: 'pending', label: 'Menunggu' },
            { key: 'diproses', label: 'Diproses' },
            { key: 'selesai', label: 'Selesai' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                activeTab === tab.key
                  ? 'bg-[#2C1810] text-white'
                  : 'text-stone-600 hover:text-[#2C1810] hover:bg-[#FAF6F0]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Order Day Filter: Semua, PO Senin, PO Selasa */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-stone-500 whitespace-nowrap mr-1">Filter Hari:</span>
          {[
            { key: 'all', label: `Semua (${counts.all})` },
            { key: 'po-senin', label: `📅 Senin (${counts.poSenin})` },
            { key: 'po-selasa', label: `🗓️ Selasa (${counts.poSelasa})` },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setOrderTypeFilter(item.key)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap active:scale-95 ${
                orderTypeFilter === item.key
                  ? 'bg-[#C83E4D] text-white'
                  : 'bg-white text-stone-700 hover:border-[#2C1810] border border-stone-200/90'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid: 1 col on Mobile, 2 cols on Laptop */}
      <div className="pt-1">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-14 px-4 rounded-2xl bg-white border border-stone-200 space-y-2">
            <p className="font-fredoka font-bold text-sm text-[#2C1810]">
              Tidak ada pesanan di kategori ini
            </p>
            <p className="text-xs text-stone-500">
              Pesanan baru yang dibuat pelanggan akan otomatis muncul di antrean ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {filteredOrders.map((order, idx) => {
            const sizeObj = SIZE_OPTIONS.find(s => s.id === order.size);
            const servingObj = SERVING_OPTIONS.find(s => s.id === order.serving);
            const toppingsFormatted = (order.toppings || [])
              .map(tid => {
                const t = TOPPINGS.find(item => item.id === tid);
                return t ? `${t.icon} ${t.name}` : tid;
              })
              .join(', ');

            return (
              <div
                key={`${order.orderId}-${order.timestamp || idx}`}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 space-y-3.5 transition-all flex flex-col justify-between"
              >
                {/* Header card: ID, Time, Status */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-fredoka font-bold text-base text-[#2C1810]">
                      {order.orderId}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(order.timestamp)}
                    </span>
                  </div>

                  {/* Status & Payment Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {order.paymentStatus === 'paid' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        ✓ Lunas ({(order.paymentMethod || 'qris').toUpperCase()})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                        Belum Bayar ({(order.paymentMethod || 'qris').toUpperCase()})
                      </span>
                    )}

                    {order.status === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                        Menunggu
                      </span>
                    )}
                    {order.status === 'diproses' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                        Diproses
                      </span>
                    )}
                    {order.status === 'selesai' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        Siap
                      </span>
                    )}
                  </div>
                </div>

                {/* Pre-Order Schedule Ribbon */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F0] border border-stone-200/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span>🗓️</span>
                    <span className="font-bold text-[#2C1810]">
                      Penerimaan: {order.poSessionName || 'Senin / Selasa'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                    Produksi Sabtu
                  </span>
                </div>

                {/* Attached Payment Proof Card */}
                {order.proofImageUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={order.proofImageUrl}
                        alt="Bukti Transfer"
                        onClick={() => setSelectedProofOrder(order)}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-300 cursor-pointer hover:opacity-90 transition-all shrink-0"
                        title="Klik untuk perbesar bukti transfer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-fredoka font-bold text-xs text-[#2C1810] truncate">
                            Bukti Transfer Terlampir
                          </span>
                          {order.paymentStatus === 'paid' ? (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                              LUNAS
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              PERLU CEK
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">
                          {order.paymentStatus === 'paid'
                            ? 'Pembayaran telah terverifikasi.'
                            : 'Klik tombol untuk cek foto & verifikasi.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedProofOrder(order)}
                      className="px-3 py-1.5 rounded-lg bg-[#2C1810] hover:bg-[#3F2419] text-white font-fredoka font-semibold text-xs active:scale-95 transition-all flex items-center gap-1 shrink-0 ml-2"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Cek Bukti</span>
                    </button>
                  </div>
                )}

                {/* Customer name and ordered item */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-stone-700 font-semibold">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span>Pemesan: <strong className="text-[#2C1810]">{order.customerName}</strong></span>
                    </div>
                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/${normalizeWhatsAppNumber(order.customerPhone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 transition-colors"
                        title="Klik untuk buka chat WhatsApp dengan pembeli"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{order.customerPhone}</span>
                      </a>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF6F0] border border-stone-200/80 flex items-start gap-3">
                    <div className="text-xl mt-0.5">{order.flavor.emoji}</div>
                    <div className="flex-1 text-xs">
                      <div className="font-fredoka font-bold text-sm text-[#2C1810]">
                        Gabin {order.flavor.name}
                        {order.secondFlavor && (
                          <span className="text-[#C83E4D]"> + {order.secondFlavor.name}</span>
                        )}
                      </div>
                      <div className="text-stone-500 font-medium">
                        {sizeObj?.name || 'Gabin Original'}
                      </div>
                      {toppingsFormatted && (
                        <div className="text-stone-700 text-[11px] font-semibold mt-1">
                          Topping: {toppingsFormatted}
                        </div>
                      )}
                      {order.notes && (
                        <div className="mt-1.5 p-1.5 rounded-lg bg-white border border-stone-200 text-[11px] text-stone-700 italic">
                          "{order.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer card: Total price & Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Total Bayar</span>
                    <span className="font-fredoka font-bold text-sm text-[#2C1810]">
                      {formatRupiah(order.totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Quick Payment Verification Button if unpaid */}
                    {order.paymentStatus !== 'paid' && (
                      order.paymentMethod === 'cash' ? (
                        <button
                          type="button"
                          onClick={() => setCashOrderToPay(order)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-fredoka font-semibold text-xs active:scale-95 transition-all flex items-center gap-1"
                          title="Buka kalkulator uang kembalian kasir"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>Terima Tunai</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updatePaymentStatus(order.orderId, 'paid')}
                          className="px-3 py-1.5 rounded-xl bg-[#C83E4D] hover:bg-rose-700 text-white font-fredoka font-semibold text-xs active:scale-95 transition-all flex items-center gap-1"
                          title="Tandai pembayaran QRIS sudah masuk"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Lunas QRIS</span>
                        </button>
                      )
                    )}

                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleNextStatus(order)}
                        className="px-3.5 py-2 rounded-xl bg-[#2C1810] hover:bg-[#3F2419] text-white font-fredoka font-semibold text-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Mulai Buat</span>
                      </button>
                    )}

                    {order.status === 'diproses' && (
                      <>
                        <button
                          onClick={() => handleNextStatus(order)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-fredoka font-semibold text-xs active:scale-95 transition-all flex items-center gap-1"
                          title="Tandai pesanan selesai"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selesai</span>
                        </button>
                        {order.customerPhone && (
                          <button
                            onClick={() => handleCompleteAndSendWA(order)}
                            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-fredoka font-semibold text-xs active:scale-95 transition-all flex items-center gap-1"
                            title="Tandai selesai dan langsung buka WhatsApp untuk kabari pembeli"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>Selesai &amp; WA</span>
                          </button>
                        )}
                      </>
                    )}

                    {order.status === 'selesai' && (
                      <>
                        {order.customerPhone ? (
                          <a
                            href={createOrderReadyWhatsAppUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-fredoka font-semibold text-xs active:scale-95 transition-all flex items-center gap-1.5"
                            title="Kirim pesan WhatsApp bahwa es krim sudah siap diambil"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>Kirim WA Siap Ambil</span>
                          </a>
                        ) : (
                          <span className="text-[11px] font-medium text-stone-400 italic pr-1">
                            (Tanpa WA)
                          </span>
                        )}
                        <button
                          onClick={() => updateOrderStatus(order.orderId, 'pending')}
                          className="px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold"
                          title="Reset ke pending"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setOrderToDelete(order)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Hapus Pesanan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Admin Quick Tools */}
      {orderQueue.length > 0 && (
        <div className="pt-4 border-t border-stone-200 flex items-center justify-end text-xs">
          <button
            onClick={clearQueue}
            className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Semua Antrean</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-fredoka font-bold text-base text-icechoco-900">
                  Hapus Pesanan Ini?
                </h3>
                <p className="text-xs text-icechoco-600 mt-0.5">
                  Pesanan <span className="font-bold text-rose-600">{orderToDelete.orderId}</span> atas nama <span className="font-bold text-icechoco-900">{orderToDelete.customerName}</span> akan dihapus permanen dari antrean dan database cloud.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-icechoco-600 hover:bg-cream-100 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOrder(orderToDelete.orderId);
                  setOrderToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-fredoka font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Management Modal */}
      <StockManagementModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
      />

      {/* Sync Settings Modal */}
      <SyncSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* QRIS Merchant Settings Modal */}
      <QRISSettingsModal
        isOpen={isQrisModalOpen}
        onClose={() => setIsQrisModalOpen(false)}
      />

      {/* Cash Change Calculator Modal */}
      <CashChangeCalculatorModal
        isOpen={Boolean(cashOrderToPay)}
        order={cashOrderToPay}
        onClose={() => setCashOrderToPay(null)}
        onConfirmPaid={(orderId, method) => {
          updatePaymentStatus(orderId, 'paid', method);
        }}
      />

      {/* Pre-Order 1-Day Event Settings Modal */}
      <POSettingsModal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
      />

      {/* Payment Proof Viewer Modal */}
      <ProofViewerModal
        isOpen={Boolean(selectedProofOrder)}
        order={selectedProofOrder}
        onClose={() => setSelectedProofOrder(null)}
        onVerifyPaid={(orderId) => {
          updatePaymentStatus(orderId, 'paid', 'qris');
          setSelectedProofOrder(prev => (prev ? { ...prev, paymentStatus: 'paid' } : null));
        }}
      />
    </div>
  );
}


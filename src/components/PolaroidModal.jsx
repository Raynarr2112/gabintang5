import React, { useRef, useState } from 'react';
import { X, Download, Share2, Sparkles, Check } from 'lucide-react';
import { playCutePopSound, playCameraShutterSound, playSparkleSound } from '../utils/audioAlert';
import { formatTime } from '../utils/formatters';
import { SERVING_OPTIONS, SIZE_OPTIONS, TOPPINGS } from '../data/flavors';

export default function PolaroidModal({ isOpen, onClose, ticket }) {
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !ticket) return null;

  const servingObj = SERVING_OPTIONS.find(s => s.id === ticket.serving);
  const sizeObj = SIZE_OPTIONS.find(s => s.id === ticket.size);
  const toppingNames = (ticket.toppings || [])
    .map(topId => TOPPINGS.find(t => t.id === topId)?.name)
    .filter(Boolean);

  const flavorName = ticket.secondFlavor
    ? `${ticket.flavor.name} + ${ticket.secondFlavor.name}`
    : ticket.flavor.name;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      playCameraShutterSound();

      // Create an offscreen canvas to render a high-res 800x1050 Instagram-ready Polaroid
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = 800;
      const height = 1050;
      canvas.width = width;
      canvas.height = height;

      // 1. Warm cream photo background
      ctx.fillStyle = '#FFFDF9';
      ctx.fillRect(0, 0, width, height);

      // Subtle border outline
      ctx.strokeStyle = '#F1E9DF';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // 2. Washi tape on top
      ctx.save();
      ctx.fillStyle = 'rgba(255, 182, 193, 0.85)';
      ctx.translate(width / 2, 35);
      ctx.rotate(-0.02);
      ctx.fillRect(-100, -18, 200, 36);
      ctx.strokeStyle = 'rgba(255, 150, 170, 0.9)';
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(-100, -18, 200, 36);
      ctx.restore();

      // 3. Photographic Inner Frame
      const photoX = 60;
      const photoY = 90;
      const photoW = 680;
      const photoH = 680;

      // Gradient photo background based on flavor
      const grad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
      grad.addColorStop(0, '#FFF5EB');
      grad.addColorStop(0.5, '#FFEAEF');
      grad.addColorStop(1, '#FFF0F5');
      ctx.fillStyle = grad;
      ctx.fillRect(photoX, photoY, photoW, photoH);

      // Photo inner border
      ctx.strokeStyle = '#F0DFD5';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(photoX, photoY, photoW, photoH);

      // 4. Central Graphic (Artisan Gabin)
      ctx.font = '140px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ticket.flavor.emoji || '🥪', width / 2, photoY + 280);

      // Cute sparkles around
      ctx.font = '36px "Segoe UI Emoji", sans-serif';
      ctx.fillText('✨', width / 2 - 180, photoY + 180);
      ctx.fillText('💖', width / 2 + 180, photoY + 200);
      ctx.fillText('⭐', width / 2 - 140, photoY + 400);
      ctx.fillText('🥪', width / 2 + 150, photoY + 420);

      // Flavor Name banner inside photo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      const bannerW = 480;
      const bannerH = 75;
      const bannerX = (width - bannerW) / 2;
      const bannerY = photoY + photoH - 120;
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 20);
      ctx.fill();
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#4A2810';
      ctx.font = 'bold 28px "Fredoka", "Arial Rounded MT Bold", sans-serif';
      ctx.fillText(flavorName, width / 2, bannerY + 42);

      // 5. Bottom Polaroid Space (Handwritten style)
      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 36px "Fredoka", cursive, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Spesial untuk ${ticket.customerName || 'Sahabat Scoop'} 💕`, photoX + 10, photoY + photoH + 70);

      // Subtitle details
      ctx.fillStyle = '#78350F';
      ctx.font = '22px "Fredoka", sans-serif';
      const servingLabel = servingObj ? servingObj.name : 'Gabin Sandwich';
      const sizeLabel = sizeObj ? sizeObj.name : 'Single Scoop';
      const toppingText = toppingNames.length > 0 ? ` + ${toppingNames.join(', ')}` : '';
      ctx.fillText(`${servingLabel} • ${sizeLabel}${toppingText}`, photoX + 10, photoY + photoH + 110);

      // Vintage Stamp Badge on bottom right
      ctx.save();
      ctx.translate(width - 150, photoY + photoH + 130);
      ctx.rotate(0.08);
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(-85, -35, 170, 70);
      ctx.fillStyle = 'rgba(254, 226, 226, 0.5)';
      ctx.fillRect(-85, -35, 170, 70);

      ctx.fillStyle = '#BE123C';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.orderType === 'po' ? '⭐ VIP PO ⭐' : '100% RENYAH', 0, -8);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(ticket.orderType === 'po' ? (ticket.poSessionName ? ticket.poSessionName.toUpperCase() : 'FAST-TRACK') : '★ BOOTH CERTIFIED ★', 0, 16);
      ctx.restore();

      // Timestamp & Watermark at very bottom
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      const ticketTime = new Date(ticket.timestamp);
      const dateStr = ticketTime.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      ctx.fillText(`SCOOPMATCH BOOTH • ${ticket.orderId} • ${dateStr} ${formatTime(ticket.timestamp)}`, photoX + 10, photoY + photoH + 165);
      ctx.fillText(`Made with Crispy Gabin & Love ✨`, photoX + 10, photoY + photoH + 190);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ScoopMatch-Polaroid-${ticket.orderId.replace('#', '')}.png`;
      link.href = dataUrl;
      link.click();

      playSparkleSound();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate polaroid image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWA = () => {
    playCutePopSound();
    const text = encodeURIComponent(
      `Lihat deh kartu foto pesanan es krim gabin aku di ScoopMatch! 🥪🍨✨\n` +
      `Menu: ${flavorName}\n` +
      `Nomor Antrean: ${ticket.orderId}\n` +
      `Biskuit gabinnya renyah parah, rasanya lumer di mulut! 🤤💖`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-icechoco-900/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm flex flex-col items-center space-y-4">
        {/* Top Controls Header */}
        <div className="w-full flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 font-fredoka font-bold text-sm bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Kartu Polaroid Si Gabin</span>
          </div>
          <button
            onClick={() => {
              playCutePopSound();
              onClose();
            }}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Polaroid Card */}
        <div
          ref={cardRef}
          className="w-full bg-[#FFFDF9] rounded-2xl p-5 shadow-2xl border-4 border-white transform transition-transform hover:scale-[1.01] relative select-none"
        >
          {/* Pastel Washi Tape at Top */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-32 h-7 bg-rose-200/80 border border-dashed border-rose-400 rotate-[-1.5deg] rounded-sm shadow-xs flex items-center justify-center">
            <span className="text-[10px] font-extrabold text-rose-700 tracking-wider">
              GABINTANG5 ✨
            </span>
          </div>

          {/* Photo Window */}
          <div className="relative w-full aspect-square rounded-xl bg-gradient-to-b from-amber-50 via-rose-50 to-pink-100 border-2 border-stone-200 overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner">
            {/* Cute Background Sprinkles */}
            <span className="absolute top-3 left-4 text-xl opacity-80 animate-pulse">✨</span>
            <span className="absolute top-4 right-4 text-xl opacity-80">💖</span>
            <span className="absolute bottom-14 left-4 text-xl opacity-75">🥪</span>
            <span className="absolute bottom-14 right-4 text-xl opacity-75">⭐</span>

            {/* Central Big Mascot / Ice Cream */}
            <div className="text-7xl sm:text-8xl drop-shadow-md animate-bounce transform hover:scale-110 transition-transform cursor-pointer">
              {ticket.flavor.emoji || '🥪'}
            </div>

            {/* Flavor Tag Inside Photo */}
            <div className="absolute bottom-3 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-amber-300 shadow-sm text-center">
              <span className="font-fredoka font-bold text-xs sm:text-sm text-amber-950">
                {flavorName}
              </span>
            </div>
          </div>

          {/* Polaroid Bottom Border & Handwritten Memo */}
          <div className="pt-4 pb-1 space-y-1.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-fredoka font-bold text-base text-rose-600 leading-tight">
                  Spesial untuk {ticket.customerName || 'Sahabat'} 💕
                </p>
                <p className="text-xs text-amber-900 font-medium">
                  {servingObj ? servingObj.name : 'Gabin Sandwich'} &bull; {sizeObj ? sizeObj.name : 'Single Scoop'}
                  {toppingNames.length > 0 && ` + ${toppingNames.join(', ')}`}
                </p>
              </div>

              {/* Vintage Stamp */}
              <div className="border-2 border-dashed border-rose-400 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider rotate-3 shrink-0">
                {ticket.orderType === 'po' ? '⭐ VIP PO 1 HARI' : '100% RENYAH'}
              </div>
            </div>

            {/* Simulated Barcode & Serial */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-200/70 text-[10px] text-stone-600 font-mono">
              <span className="font-bold tracking-widest">{ticket.orderId}</span>
              <span>{formatTime(ticket.timestamp)} &bull; Crispy &amp; Sweet</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2 pt-1">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-fredoka font-bold text-sm shadow-lg shadow-rose-500/40 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Foto Polaroid Berhasil Disimpan!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Menyimpan Foto...' : 'Simpan Foto Polaroid (HD PNG)'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareWA}
            className="w-full py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-fredoka font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Pamerkan ke Status WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

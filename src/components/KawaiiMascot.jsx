import React, { useState } from 'react';
import { playCutePopSound } from '../utils/audioAlert';

const CUTE_QUOTES = [
  'Hai bestie! Aku renyah di luar, manis lumer di dalem! 🥪💖',
  'Jangan lupa coba topping Keju Parut ya, gurih mantul! 🧀✨',
  'Gabin es krim itu bikin mood kamu auto 100%! 🥰',
  'Pencet aku lagi dong, geli tauu hihi! 🙈🎉',
  'Bingung pilih rasa? Tenang, kuis kita gak pernah salah tebak! 🍦',
  'Dibuat dengan cinta, disajikan dengan senyuman! 💕',
];

export default function KawaiiMascot({ _mood = 'happy' }) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const [hearts, setHearts] = useState([]);

  const handleMascotTap = () => {
    playCutePopSound();
    setIsBouncing(true);

    // Trigger mini floating heart animation
    const newHeart = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 40,
    };
    setHearts(prev => [...prev.slice(-4), newHeart]);

    // Next quote
    setQuoteIndex(prev => (prev + 1) % CUTE_QUOTES.length);

    setTimeout(() => {
      setIsBouncing(false);
    }, 450);
  };

  return (
    <div className="relative inline-flex flex-col items-center select-none group">
      {/* Floating Interactive Speech Bubble */}
      <div
        onClick={handleMascotTap}
        className="cursor-pointer mb-2 px-3.5 py-2 rounded-2xl bg-white/95 border-2 border-rose-200 shadow-md max-w-[240px] text-center transform transition-all duration-300 hover:scale-105 active:scale-95 relative animate-fade-in"
      >
        <p className="text-xs font-bold text-icechoco-900 leading-snug">
          {CUTE_QUOTES[quoteIndex]}
        </p>
        <span className="text-[10px] text-rose-500 font-semibold block mt-0.5 opacity-80">
          (Tap aku! ✨)
        </span>
        {/* Bubble Tail */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-rose-200 rotate-45" />
      </div>

      {/* Floating Hearts Effect on Tap */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {hearts.map(h => (
          <span
            key={h.id}
            className="absolute top-0 left-1/2 text-rose-500 animate-ping text-sm"
            style={{ transform: `translate(${h.x}px, -20px)` }}
          >
            💖
          </span>
        ))}
      </div>

      {/* Kawaii Mascot SVG: "Si Gabin" */}
      <div
        onClick={handleMascotTap}
        className={`cursor-pointer transition-transform duration-300 ${
          isBouncing ? 'scale-115 rotate-3' : 'hover:scale-108 hover:-rotate-2'
        }`}
        title="Klik Si Gabin!"
      >
        <svg
          className="w-28 h-28 drop-shadow-md"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chef Hat */}
          <g transform="translate(42, 8) rotate(-10)">
            <path
              d="M 8 18 Q 0 10, 8 2 Q 18 -4, 26 2 Q 36 2, 34 12 Q 36 20, 26 18 Z"
              fill="#FFFFFF"
              stroke="#F43F5E"
              strokeWidth="2.5"
            />
            <rect x="7" y="16" width="22" height="7" rx="3" fill="#F43F5E" />
          </g>

          {/* Left Cute Arm */}
          <path
            d="M 18 64 C 8 58, 6 48, 14 44 C 20 42, 22 52, 24 58"
            stroke="#D97706"
            strokeWidth="5"
            strokeLinecap="round"
            fill="#FDE68A"
          />

          {/* Right Waving Cute Arm */}
          <path
            d="M 102 64 C 112 56, 114 44, 106 40 C 98 38, 96 50, 94 58"
            stroke="#D97706"
            strokeWidth="5"
            strokeLinecap="round"
            fill="#FDE68A"
            className="animate-wiggle origin-bottom-left"
          />

          {/* Top Gabin Cracker */}
          <rect
            x="20"
            y="32"
            width="80"
            height="18"
            rx="5"
            fill="#FDE68A"
            stroke="#D97706"
            strokeWidth="3.5"
          />
          {/* Top Cracker Perforations */}
          <circle cx="30" cy="41" r="1.8" fill="#B45309" />
          <circle cx="45" cy="41" r="1.8" fill="#B45309" />
          <circle cx="60" cy="41" r="1.8" fill="#B45309" />
          <circle cx="75" cy="41" r="1.8" fill="#B45309" />
          <circle cx="90" cy="41" r="1.8" fill="#B45309" />

          {/* Thick Creamy Ice Cream Middle */}
          <rect
            x="24"
            y="48"
            width="72"
            height="34"
            rx="6"
            fill="#FFF1F2"
            stroke="#FB7185"
            strokeWidth="3"
          />

          {/* Ice Cream Sprinkles on the sides */}
          <rect x="28" y="54" width="4" height="2" rx="1" fill="#38BDF8" transform="rotate(20 28 54)" />
          <rect x="88" y="55" width="4" height="2" rx="1" fill="#F43F5E" transform="rotate(-30 88 55)" />
          <rect x="29" y="72" width="4" height="2" rx="1" fill="#FBBF24" transform="rotate(-15 29 72)" />
          <rect x="87" y="70" width="4" height="2" rx="1" fill="#34D399" transform="rotate(25 87 70)" />

          {/* KAWAII FACE */}
          {/* Left Eye */}
          <circle cx="44" cy="62" r="5" fill="#372620" />
          <circle cx="42.5" cy="60" r="2" fill="#FFFFFF" />
          <circle cx="45.5" cy="63.5" r="1" fill="#FFFFFF" />

          {/* Right Eye (winking or shiny) */}
          <circle cx="76" cy="62" r="5" fill="#372620" />
          <circle cx="74.5" cy="60" r="2" fill="#FFFFFF" />
          <circle cx="77.5" cy="63.5" r="1" fill="#FFFFFF" />

          {/* Cute Rosy Blushing Cheeks */}
          <ellipse cx="36" cy="68" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.85" />
          <ellipse cx="84" cy="68" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.85" />

          {/* Happy Open Smile */}
          <path
            d="M 54 66 Q 60 74, 66 66"
            stroke="#372620"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="#F43F5E"
          />

          {/* Bottom Gabin Cracker */}
          <rect
            x="20"
            y="80"
            width="80"
            height="18"
            rx="5"
            fill="#FDE68A"
            stroke="#D97706"
            strokeWidth="3.5"
          />
          {/* Bottom Cracker Perforations */}
          <circle cx="30" cy="89" r="1.8" fill="#B45309" />
          <circle cx="45" cy="89" r="1.8" fill="#B45309" />
          <circle cx="60" cy="89" r="1.8" fill="#B45309" />
          <circle cx="75" cy="89" r="1.8" fill="#B45309" />
          <circle cx="90" cy="89" r="1.8" fill="#B45309" />

          {/* Tiny Cute Little Feet */}
          <ellipse cx="46" cy="101" rx="6" ry="4" fill="#D97706" />
          <ellipse cx="74" cy="101" rx="6" ry="4" fill="#D97706" />
        </svg>
      </div>

      {/* Mascot Name Tag */}
      <span className="mt-1 text-[11px] font-fredoka font-bold text-icechoco-700 bg-amber-100/90 border border-amber-300/80 px-2.5 py-0.5 rounded-full shadow-2xs">
        🥪 Si Gabin Mascot
      </span>
    </div>
  );
}

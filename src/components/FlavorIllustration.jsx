import React from 'react';

/**
 * High-quality vector illustration for Gabin Es Krim (Ice Cream Biscuit Sandwich)
 * Renders an appetizing Gabin sandwich with golden crispy crackers, thick ice cream filling, and toppings.
 */
export default function FlavorIllustration({
  flavorId = 'coklat',
  serving = 'gabin-sweet',
  size = 'single',
  toppings = [],
  className = 'w-48 h-48',
}) {
  // Theme gradients & colors per flavor
  const flavorStyles = {
    yoghurt: {
      scoop1: '#F0F9FF',
      scoop2: '#BAE6FD',
      swirl: '#38BDF8',
      highlight: '#FFFFFF',
      drops: '#7DD3FC',
    },
    strawberry: {
      scoop1: '#F43F5E',
      scoop2: '#FB7185',
      swirl: '#BE123C',
      highlight: '#FDA4AF',
      drops: '#E11D48',
    },
    coklat: {
      scoop1: '#4A2C21',
      scoop2: '#2F180F',
      swirl: '#1F0F09',
      highlight: '#7D4D3D',
      drops: '#3B1D12',
    },
    matcha: {
      scoop1: '#15803D',
      scoop2: '#166534',
      swirl: '#14532D',
      highlight: '#86EFAC',
      drops: '#166534',
    },
    mangga: {
      scoop1: '#F59E0B',
      scoop2: '#D97706',
      swirl: '#B45309',
      highlight: '#FDE047',
      drops: '#F59E0B',
    },
    // Legacy fallbacks
    'choco-therapy': {
      scoop1: '#4A2C21',
      scoop2: '#2F180F',
      swirl: '#1F0F09',
      highlight: '#7D4D3D',
      drops: '#3B1D12',
    },
    'berry-blast': {
      scoop1: '#F43F5E',
      scoop2: '#FB7185',
      swirl: '#BE123C',
      highlight: '#FDA4AF',
      drops: '#E11D48',
    },
    'vanilla-dream': {
      scoop1: '#FEF08A',
      scoop2: '#FDE047',
      swirl: '#F59E0B',
      highlight: '#FEF9C3',
      drops: '#EAB308',
    },
    'caramel-crunch': {
      scoop1: '#D97706',
      scoop2: '#B45309',
      swirl: '#78350F',
      highlight: '#FCD34D',
      drops: '#92400E',
    },
    'matcha-zen': {
      scoop1: '#15803D',
      scoop2: '#166534',
      swirl: '#14532D',
      highlight: '#86EFAC',
      drops: '#166534',
    },
  };

  const style = flavorStyles[flavorId] || flavorStyles.coklat;
  const isDouble = size === 'double';
  const isCup = serving === 'cup';

  const hasOreo = toppings.includes('oreo');
  const hasSprinkle = toppings.includes('sprinkle');
  const hasKeju = toppings.includes('keju');
  const hasBuahMangga = toppings.includes('buah-mangga');
  const hasBuahStrawberry = toppings.includes('buah-strawberry');
  const hasSelaiCaramel = toppings.includes('selai-caramel');
  const hasSelaiBlueberry = toppings.includes('selai-blueberry');
  const hasSelaiCoklat = toppings.includes('selai-coklat');

  // Legacy support
  const hasBoba = toppings.includes('boba');
  const hasChips = toppings.includes('choco-chips') || hasSelaiCoklat;
  const hasAlmond = toppings.includes('almond');

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full drop-shadow-xl animate-float transition-all duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ice Cream Gradients */}
          <linearGradient id={`grad-icecream1-${flavorId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={style.highlight} />
            <stop offset="60%" stopColor={style.scoop1} />
            <stop offset="100%" stopColor={style.scoop2} />
          </linearGradient>

          <linearGradient id={`grad-icecream2-${flavorId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={style.highlight} />
            <stop offset="50%" stopColor={style.scoop2} />
            <stop offset="100%" stopColor={style.swirl} />
          </linearGradient>

          {/* Crispy Golden Gabin Cracker Gradients */}
          <linearGradient id="gabin-top-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="85%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="gabin-bot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="60%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          <linearGradient id="cup-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE4EC" />
            <stop offset="50%" stopColor="#FFD1DC" />
            <stop offset="100%" stopColor="#FCA5B7" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="100" cy="115" r="75" fill={style.scoop1} opacity="0.18" filter="blur(16px)" />

        {/* SPARKLES */}
        <g className="animate-pulse-glow">
          <path d="M 35 45 Q 38 45 39 41 Q 40 45 43 45 Q 40 46 39 50 Q 38 46 35 45 Z" fill="#FBBF24" />
          <path d="M 165 60 Q 168 60 169 56 Q 170 60 173 60 Q 170 61 169 65 Q 168 61 165 60 Z" fill="#FBBF24" />
          <path d="M 160 145 Q 163 145 164 142 Q 165 145 168 145 Q 165 146 164 149 Q 163 146 160 145 Z" fill="#FB7185" />
        </g>

        {!isCup ? (
          /* ========================================================
             GABIN ES KRIM SANDWICH (CLASSIC CRISPY BISCUIT SANDWICH)
             ======================================================== */
          <g id="gabin-sandwich" transform={isDouble ? "translate(0, 10)" : "translate(0, 20)"}>
            {/* 1. BOTTOM GABIN CRACKER */}
            <g id="bottom-gabin">
              {/* Drop Shadow of bottom cracker */}
              <ellipse cx="100" cy={isDouble ? "198" : "175"} rx="62" ry="8" fill="#000000" opacity="0.12" />

              {/* Bottom Cracker Crust Body */}
              <rect
                x="32"
                y={isDouble ? "152" : "135"}
                width="136"
                height="32"
                rx="9"
                fill="url(#gabin-bot-grad)"
                stroke="#92400E"
                strokeWidth="2"
              />

              {/* Cracker Edge Highlight */}
              <rect
                x="35"
                y={isDouble ? "154" : "137"}
                width="130"
                height="5"
                rx="2"
                fill="#FEF3C7"
                opacity="0.4"
              />

              {/* Cracker Punctures / Dots (Perforations) */}
              <g fill="#78350F" opacity="0.6">
                {[48, 70, 92, 114, 136].map((x, i) => (
                  <circle key={`bot-dot-${i}`} cx={x} cy={isDouble ? "168" : "151"} r="2" />
                ))}
              </g>
            </g>

            {/* 2. THICK ICE CREAM FILLING (SANDWICHED IN MIDDLE) */}
            <g id="ice-cream-slab">
              {/* Double filling lower layer */}
              {isDouble && (
                <rect
                  x="36"
                  y="112"
                  width="128"
                  height="45"
                  rx="12"
                  fill={`url(#grad-icecream2-${flavorId})`}
                />
              )}

              {/* Main Ice Cream Slab */}
              <rect
                x="36"
                y={isDouble ? "80" : "78"}
                width="128"
                height={isDouble ? "50" : "64"}
                rx="14"
                fill={`url(#grad-icecream1-${flavorId})`}
              />

              {/* Creamy Side Ripples & Bulge Effect */}
              <path
                d={isDouble 
                  ? "M 34 95 C 28 115 28 135 34 150 C 40 152 42 148 42 135 C 42 110 38 98 34 95 Z"
                  : "M 34 88 C 28 105 28 122 34 135 C 40 137 42 133 42 122 C 42 100 38 91 34 88 Z"}
                fill={style.scoop1}
              />
              <path
                d={isDouble 
                  ? "M 166 95 C 172 115 172 135 166 150 C 160 152 158 148 158 135 C 158 110 162 98 166 95 Z"
                  : "M 166 88 C 172 105 172 122 166 135 C 160 137 158 133 158 122 C 158 100 162 91 166 88 Z"}
                fill={style.scoop1}
              />

              {/* Delicious Drip Droplet */}
              <path
                d={isDouble 
                  ? "M 88 155 C 86 168 87 176 91 176 C 95 176 96 168 94 155 Z"
                  : "M 88 138 C 86 150 87 158 91 158 C 95 158 96 150 94 138 Z"}
                fill={style.drops}
              />

              {/* Soft Cream Highlight Sheen */}
              <ellipse
                cx="100"
                cy={isDouble ? "105" : "105"}
                rx="48"
                ry="8"
                fill="#FFFFFF"
                opacity="0.3"
              />
            </g>

            {/* 3. TOPPING VISUALS EMBEDDED IN ICE CREAM */}
            {/* Oreo crumble */}
            {hasOreo && (
              <g fill="#18181B">
                <rect x="52" y={isDouble ? "95" : "90"} width="7" height="6" rx="2" transform="rotate(15 52 95)" />
                <rect x="135" y={isDouble ? "105" : "98"} width="8" height="6" rx="2" transform="rotate(-20 135 105)" />
                <rect x="88" y={isDouble ? "120" : "110"} width="6" height="5" rx="1.5" transform="rotate(35 88 120)" />
                <rect x="115" y={isDouble ? "130" : "118"} width="7" height="5" rx="1.5" transform="rotate(-10 115 130)" />
              </g>
            )}

            {/* Shredded Cheddar Cheese Flakes */}
            {hasKeju && (
              <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" opacity="0.95">
                <line x1="55" y1={isDouble ? "105" : "96"} x2="72" y2={isDouble ? "108" : "99"} stroke="#FDE047" />
                <line x1="120" y1={isDouble ? "112" : "102"} x2="138" y2={isDouble ? "118" : "108"} stroke="#FACC15" />
                <line x1="78" y1={isDouble ? "128" : "115"} x2="96" y2={isDouble ? "131" : "118"} stroke="#FDE047" />
                <line x1="105" y1={isDouble ? "98" : "90"} x2="124" y2={isDouble ? "96" : "88"} stroke="#FACC15" />
                <line x1="62" y1={isDouble ? "135" : "122"} x2="78" y2={isDouble ? "140" : "127"} stroke="#FDE047" />
              </g>
            )}

            {/* Boba pearls */}
            {hasBoba && (
              <g>
                <circle cx="58" cy={isDouble ? "110" : "100"} r="6" fill="#1C1917" stroke="#44403C" strokeWidth="1" />
                <circle cx="56" cy={isDouble ? "108" : "98"} r="1.5" fill="#FFFFFF" opacity="0.8" />
                <circle cx="138" cy={isDouble ? "120" : "108"} r="6" fill="#1C1917" stroke="#44403C" strokeWidth="1" />
                <circle cx="136" cy={isDouble ? "118" : "106"} r="1.5" fill="#FFFFFF" opacity="0.8" />
                <circle cx="102" cy={isDouble ? "132" : "120"} r="5.5" fill="#1C1917" />
              </g>
            )}

            {/* Choco Chips */}
            {hasChips && (
              <g fill="#3B1D12">
                <path d={isDouble ? "M 70 102 L 76 102 L 73 95 Z" : "M 70 95 L 76 95 L 73 88 Z"} />
                <path d={isDouble ? "M 125 112 L 131 112 L 128 105 Z" : "M 125 105 L 131 105 L 128 98 Z"} />
                <path d={isDouble ? "M 92 125 L 98 125 L 95 118 Z" : "M 92 115 L 98 115 L 95 108 Z"} />
              </g>
            )}

            {/* Roasted Almonds */}
            {hasAlmond && (
              <g fill="#D97706" stroke="#92400E" strokeWidth="0.8">
                <ellipse cx="68" cy={isDouble ? "115" : "105"} rx="5.5" ry="3" transform="rotate(-25 68 115)" />
                <ellipse cx="128" cy={isDouble ? "125" : "112"} rx="5" ry="3" transform="rotate(30 128 125)" />
              </g>
            )}

            {/* Rainbow Sprinkles */}
            {hasSprinkle && (
              <g strokeWidth="3" strokeLinecap="round">
                <line x1="58" y1={isDouble ? "96" : "90"} x2="65" y2={isDouble ? "93" : "87"} stroke="#EC4899" />
                <line x1="85" y1={isDouble ? "102" : "96"} x2="92" y2={isDouble ? "106" : "100"} stroke="#3B82F6" />
                <line x1="115" y1={isDouble ? "95" : "89"} x2="122" y2={isDouble ? "99" : "93"} stroke="#10B981" />
                <line x1="136" y1={isDouble ? "114" : "106"} x2="143" y2={isDouble ? "110" : "102"} stroke="#F59E0B" />
                <line x1="72" y1={isDouble ? "126" : "116"} x2="79" y2={isDouble ? "122" : "112"} stroke="#A855F7" />
              </g>
            )}

            {/* Fresh Mango Chunks */}
            {hasBuahMangga && (
              <g fill="#FBBF24" stroke="#D97706" strokeWidth="0.8">
                <rect x="62" y={isDouble ? "106" : "98"} width="9" height="8" rx="2" />
                <rect x="122" y={isDouble ? "116" : "106"} width="9" height="8" rx="2" />
              </g>
            )}

            {/* Fresh Strawberry Chunks */}
            {hasBuahStrawberry && (
              <g fill="#E11D48" stroke="#9F1239" strokeWidth="0.8">
                <circle cx="78" cy={isDouble ? "112" : "102"} r="5" />
                <circle cx="110" cy={isDouble ? "122" : "112"} r="5" />
              </g>
            )}

            {/* Jam Swirls (Caramel / Blueberry / Coklat) */}
            {hasSelaiCaramel && (
              <path
                d={isDouble ? "M 48 115 Q 75 105 100 118 T 152 112" : "M 48 106 Q 75 96 100 108 T 152 104"}
                stroke="#D97706"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            )}
            {hasSelaiBlueberry && (
              <path
                d={isDouble ? "M 50 125 Q 80 135 108 122 T 150 128" : "M 50 114 Q 80 124 108 112 T 150 118"}
                stroke="#4F46E5"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            )}
            {hasSelaiCoklat && (
              <path
                d={isDouble ? "M 52 102 Q 82 114 112 100 T 148 106" : "M 52 94 Q 82 104 112 92 T 148 98"}
                stroke="#3B1D12"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* 4. TOP GABIN CRACKER */}
            <g id="top-gabin" transform={isDouble ? "translate(0, -10)" : "translate(0, 0)"}>
              {/* Top Cracker Main Body */}
              <rect
                x="30"
                y="52"
                width="140"
                height="34"
                rx="9"
                fill="url(#gabin-top-grad)"
                stroke="#B45309"
                strokeWidth="2"
              />

              {/* Glossy Baked Cracker Sheen */}
              <rect
                x="34"
                y="55"
                width="132"
                height="6"
                rx="3"
                fill="#FFFFFF"
                opacity="0.4"
              />

              {/* Cracker Perforations / Dot Grid (3 rows x 5 cols) */}
              <g fill="#78350F" opacity="0.65">
                {[46, 68, 90, 112, 134, 154].map((x, i) => (
                  <React.Fragment key={`top-dots-${i}`}>
                    <circle cx={x} cy="63" r="1.8" />
                    <circle cx={x} cy="75" r="1.8" />
                  </React.Fragment>
                ))}
              </g>

              {/* Sparkly Sugar Grains on Gabin Cracker */}
              <g fill="#FFFFFF" opacity="0.85">
                <rect x="42" y="58" width="2" height="2" rx="0.5" />
                <rect x="62" y="68" width="2" height="2" rx="0.5" />
                <rect x="85" y="59" width="2" height="2" rx="0.5" />
                <rect x="110" y="67" width="2.5" height="2.5" rx="0.5" />
                <rect x="135" y="60" width="2" height="2" rx="0.5" />
                <rect x="148" y="70" width="2" height="2" rx="0.5" />
              </g>
            </g>
          </g>
        ) : (
          /* ========================================================
             CUP OPTION: DESSERT CUP WITH GABIN CRACKER TOPPING
             ======================================================== */
          <g id="cup-container" transform="translate(0, 20)">
            {/* Two crispy Gabin crackers inserted into top of cup */}
            <g transform="translate(68, 70) rotate(-15)">
              <rect x="0" y="0" width="35" height="45" rx="5" fill="url(#gabin-top-grad)" stroke="#B45309" strokeWidth="1.5" />
              <circle cx="10" cy="15" r="1.5" fill="#78350F" opacity="0.6" />
              <circle cx="25" cy="15" r="1.5" fill="#78350F" opacity="0.6" />
              <circle cx="10" cy="30" r="1.5" fill="#78350F" opacity="0.6" />
              <circle cx="25" cy="30" r="1.5" fill="#78350F" opacity="0.6" />
            </g>
            <g transform="translate(98, 65) rotate(15)">
              <rect x="0" y="0" width="35" height="45" rx="5" fill="url(#gabin-top-grad)" stroke="#B45309" strokeWidth="1.5" />
              <circle cx="10" cy="15" r="1.5" fill="#78350F" opacity="0.6" />
              <circle cx="25" cy="15" r="1.5" fill="#78350F" opacity="0.6" />
              <circle cx="10" cy="30" r="1.5" fill="#78350F" opacity="0.6" />
              <circle cx="25" cy="30" r="1.5" fill="#78350F" opacity="0.6" />
            </g>

            {/* Ice cream scoop peaking out of cup */}
            <ellipse cx="100" cy="100" rx="44" ry="32" fill={`url(#grad-icecream1-${flavorId})`} />

            {/* Cup Body */}
            <path
              d="M 48 105 L 58 185 C 60 193 140 193 142 185 L 152 105 Z"
              fill="url(#cup-grad)"
              stroke="#FB7185"
              strokeWidth="2"
            />
            {/* Cup Rim Band */}
            <rect
              x="44"
              y="100"
              width="112"
              height="10"
              rx="4"
              fill="#FFFFFF"
              stroke="#FDA4AF"
              strokeWidth="1.5"
            />
            {/* Cup Gabin Badge */}
            <g transform="translate(100, 146)">
              <circle cx="0" cy="0" r="16" fill="#FFFFFF" opacity="0.95" />
              <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="bold">
                🥪
              </text>
            </g>
            {/* Cup shadow */}
            <ellipse cx="100" cy="190" rx="44" ry="4" fill="#000000" opacity="0.08" />
          </g>
        )}
      </svg>
    </div>
  );
}

import React from 'react';

const FLOATING_ITEMS = [
  { emoji: '✨', top: '12%', left: '8%', delay: '0s', size: 'text-sm' },
  { emoji: '🥪', top: '22%', right: '6%', delay: '1.2s', size: 'text-lg' },
  { emoji: '💖', top: '45%', left: '4%', delay: '2.5s', size: 'text-sm' },
  { emoji: '🍦', top: '65%', right: '8%', delay: '0.8s', size: 'text-base' },
  { emoji: '🧀', top: '78%', left: '10%', delay: '1.8s', size: 'text-sm' },
  { emoji: '⭐', top: '88%', right: '12%', delay: '3.1s', size: 'text-xs' },
];

export default function FloatingSprinkles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {FLOATING_ITEMS.map((item, idx) => (
        <div
          key={idx}
          className={`absolute opacity-40 hover:opacity-100 transition-opacity animate-float ${item.size}`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            animationDelay: item.delay,
            animationDuration: '4s',
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}

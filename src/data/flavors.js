// Data varian es krim ScoopMatch
export const FLAVORS = [
  {
    id: 'yoghurt',
    name: 'Yoghurt',
    tagline: 'Creamy Tangy Greek Yoghurt',
    description: 'Es krim yoghurt lembut dengan sensasi asam-manis segar yang ringan di mulut. Cocok banget buat kamu yang lagi santai dan pengin kesegaran alami!',
    color: {
      bg: 'from-sky-400 via-cyan-400 to-teal-400',
      accent: '#0284C7',
      light: '#E0F2FE',
      badge: 'bg-sky-100 text-sky-900 border-sky-300',
    },
    moodMatch: '😌 Santai & Pengin yang Segar',
    notes: ['Asam-Manis Segar', 'Probiotic Creamy', 'Light & Refreshing'],
    recommendedTopping: 'Strawberry, Blueberry & Sprinkle',
    basePrice: 9000,
    emoji: '🥣',
    tags: ['yoghurt', 'fresh', 'chill'],
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    tagline: 'Sweet Pink Summer Strawberry',
    description: 'Perpaduan buah stroberi merah manis pilihan dengan krim susu lembut yang bikin hari kamu makin happy, ceria, dan penuh warna!',
    color: {
      bg: 'from-rose-500 via-pink-500 to-red-400',
      accent: '#E11D48',
      light: '#FFE4E6',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    moodMatch: '🥳 Happy dan Ceria',
    notes: ['100% Real Strawberries', 'Manis Segar', 'Pink & Cheerful'],
    recommendedTopping: 'Sprinkle Warna-warni & Potongan Strawberry',
    basePrice: 9000,
    emoji: '🍓',
    tags: ['strawberry', 'fruity', 'happy'],
  },
  {
    id: 'coklat',
    name: 'Coklat',
    tagline: 'Rich Belgian Dark & Milk Chocolate',
    description: 'Sensasi cokelat pekat yang lumer dan menenangkan. Pilihan paling pas saat kamu lagi capek dan butuh dihibur dengan kelezatan klasik!',
    color: {
      bg: 'from-amber-950 via-stone-800 to-amber-900',
      accent: '#684535',
      light: '#F5EBE6',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    moodMatch: '🍫 Capek & Butuh Dihibur',
    notes: ['Rich Cocoa', 'Lumer di Mulut', 'Mood Booster Terbaik'],
    recommendedTopping: 'Oreo, Keju & Selai Coklat',
    basePrice: 9000,
    emoji: '🍫',
    tags: ['chocolate', 'rich', 'comfort'],
  },
  {
    id: 'matcha',
    name: 'Matcha',
    tagline: 'Authentic Uji Japanese Matcha',
    description: 'Teh hijau Uji Jepang asli beraroma wangi menenangkan dengan perpaduan creamy yang pas. Bikin pikiran kembali tenang dan fokus!',
    color: {
      bg: 'from-emerald-600 via-green-600 to-teal-700',
      accent: '#059669',
      light: '#D1FAE5',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    moodMatch: '🧘 Tenang dan Fokus',
    notes: ['Uji Matcha Asli', 'Aroma Menenangkan', 'Earthy & Creamy'],
    recommendedTopping: 'Oreo, Keju & Selai Caramel',
    basePrice: 9000,
    emoji: '🍵',
    tags: ['matcha', 'zen', 'calm'],
  },
  {
    id: 'mangga',
    name: 'Mangga',
    tagline: 'Sweet Tropical Harumanis Mango',
    description: 'Manis segar mangga tropis pilihan yang juicy dan eksotis. Rasanya seru dan cerah banget kayak lagi suasana liburan!',
    color: {
      bg: 'from-amber-400 via-orange-400 to-yellow-500',
      accent: '#D97706',
      light: '#FEF3C7',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    moodMatch: '🏖️ Semangat Kayak Lagi Liburan',
    notes: ['Tropical Mango', 'Manis & Juicy', 'Holiday Vibes'],
    recommendedTopping: 'Potongan Mangga, Cheese & Selai Caramel',
    basePrice: 9000,
    emoji: '🥭',
    tags: ['mango', 'tropical', 'holiday'],
  },
];

export const TOPPINGS = [
  // Topping Tabur (Q3 & Q6) - Rp 2.000
  { id: 'oreo', name: 'Oreo', category: 'tabur', categoryLabel: 'Topping Tabur', price: 2000, icon: '🍪' },
  { id: 'sprinkle', name: 'Sprinkle Warna-warni', category: 'tabur', categoryLabel: 'Topping Tabur', price: 2000, icon: '✨' },
  { id: 'keju', name: 'Cheese', category: 'tabur', categoryLabel: 'Topping Tabur', price: 2000, icon: '🧀' },

  // Topping Buah (Q4 & Q6) - Rp 3.000
  { id: 'buah-mangga', name: 'Mangga', category: 'buah', categoryLabel: 'Topping Buah', price: 3000, icon: '🥭' },
  { id: 'buah-strawberry', name: 'Strawberry', category: 'buah', categoryLabel: 'Topping Buah', price: 3000, icon: '🍓' },

  // Topping Selai (Q5 & Q6) - Rp 1.000
  { id: 'selai-blueberry', name: 'Blueberry', category: 'selai', categoryLabel: 'Topping Selai', price: 1000, icon: '🫐' },
  { id: 'selai-caramel', name: 'Caramel', category: 'selai', categoryLabel: 'Topping Selai', price: 1000, icon: '🍯' },
  { id: 'selai-coklat', name: 'Coklat', category: 'selai', categoryLabel: 'Topping Selai', price: 1000, icon: '🍫' },
];

export const SERVING_OPTIONS = [
  { id: 'gabin-original', name: 'Gabin Original', price: 0, icon: '🥪', desc: 'Biskuit gabin original yang renyah dan gurih' },
];

export const SIZE_OPTIONS = [
  { id: 'single', name: 'Gabin Original (Tanpa Topping)', price: 9000, scoops: 1, desc: '1 Porsi Gabin Ice Cream Original (Rp 9.000)' },
];

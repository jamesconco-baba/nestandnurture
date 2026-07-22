export const MYSTERY_SCOOPS = [
  {
    id: 'starter',
    name: 'Starter Scoop',
    price: 15000,
    tagline: 'A sweet, budget-friendly entry-level pack — the perfect immediate welcome gift for mum and baby.',
    highlights: ['3–4 curated essentials', 'Gift-wrapped presentation', 'One surprise keepsake'],
    imageUrl: null,
  },
  {
    id: 'classic',
    name: 'Classic Scoop',
    price: 30000,
    tagline: "A full mother-and-baby care package — our flagship, most popular gifting choice.",
    highlights: ['6–8 curated essentials', 'Mum + baby balance', 'Premium gift box & ribbon', 'Two surprise keepsakes'],
    featured: true,
    imageUrl: null,
  },
  {
    id: 'deluxe',
    name: 'Deluxe Scoop',
    price: 50000,
    tagline: 'A premium, high-value celebration pack filled with luxurious materials and exclusive keepsake items.',
    highlights: ['10+ curated essentials', 'Luxury materials throughout', 'Exclusive keepsake set', 'Champagne gold gift trunk'],
    imageUrl: null,
  },
];

export const GENDERS = [
  { id: 'male', label: 'Baby Boy', description: 'Male-themed customization' },
  { id: 'female', label: 'Baby Girl', description: 'Female-themed customization' },
  { id: 'neutral', label: 'Neutral', description: 'Unisex, earthy & minimalist pastel tones' },
];

export const GREETINGS = {
  male: [
    { id: 'M1', text: 'Welcome to the world, precious little prince!' },
    { id: 'M2', text: 'So thrilled to celebrate your handsome little boy!' },
    { id: 'M3', text: '', custom: true },
  ],
  female: [
    { id: 'F1', text: 'Welcome to the world, beautiful little princess!' },
    { id: 'F2', text: 'Congratulations on the safe arrival of your gorgeous baby girl!' },
    { id: 'F3', text: '', custom: true },
  ],
  neutral: [
    { id: 'N1', text: 'Welcome to the world, sweet little one!' },
    { id: 'N2', text: 'A special gift crafted with absolute love for your beautiful family.' },
    { id: 'N3', text: '', custom: true },
  ],
};

export const BUILD_A_GIFT_MIN_BUDGET = 50000;

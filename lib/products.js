// Unit-price catalog, sourced from the Nest & Nurture item list.
// Prices are launch placeholders in NGN — edit freely, they don't affect any other logic.
export const CATEGORIES = [
  'Feeding',
  'Bath & Hygiene',
  'Clothing',
  'Nursery & Sleep',
  'Diapering',
  'On-the-go',
  'Keepsakes & Extras',
];

let _id = 0;
const item = (name, category, price) => ({
  id: `p${(_id += 1)}`,
  name,
  category,
  price,
});

export const PRODUCTS = [
  item('Jumpsuit', 'Clothing', 8500),
  item('Bibs', 'Feeding', 2000),
  item('Ear Muff', 'Clothing', 3500),
  item('Nail Set Case', 'Bath & Hygiene', 4000),
  item('Nail Transparent Set', 'Bath & Hygiene', 3000),
  item('Socket Covers (White, Pink & Green)', 'Nursery & Sleep', 1500),
  item('Ice Pack Water Filler', 'On-the-go', 2500),
  item('Pedal Play', 'Nursery & Sleep', 12000),
  item('Baby Socks (a pair)', 'Clothing', 1800),
  item('Baby Spoons', 'Feeding', 2200),
  item('Shoe Sock', 'Clothing', 3200),
  item('Pacifier Chain', 'Feeding', 3000),
  item('Nursing Bag', 'On-the-go', 15000),
  item('Silicon Plate', 'Feeding', 4500),
  item('Breast Milk Bag', 'Feeding', 3500),
  item('Finger Toothbrush', 'Bath & Hygiene', 1500),
  item('Brush Set', 'Bath & Hygiene', 3800),
  item('Baby Toys', 'Keepsakes & Extras', 5000),
  item('Sponge Brush Bath', 'Bath & Hygiene', 2000),
  item('Bottle Brush', 'Feeding', 2500),
  item('Silicon Cup', 'Feeding', 2800),
  item('Breast Milk Pad', 'Feeding', 3200),
  item('Pacifier Box', 'Feeding', 2500),
  item('Cloth Organizer', 'Nursery & Sleep', 6500),
  item('Flannels', 'Bath & Hygiene', 4000),
  item('Month Cards', 'Keepsakes & Extras', 5500),
  item('Child Safety Lock', 'Nursery & Sleep', 2200),
  item('Milk Silicone Cover', 'Feeding', 2000),
  item('Dental Wipes (5 pieces)', 'Bath & Hygiene', 1800),
  item('Milk Dispenser (Glass)', 'Feeding', 9500),
  item('Baby Nasal Aspirator', 'Bath & Hygiene', 4500),
  item('Towel', 'Bath & Hygiene', 5000),
  item('Gift Set — Bottle', 'Feeding', 12000),
  item('Teether', 'Feeding', 2800),
  item('Breast Pump (Electric)', 'Feeding', 45000),
  item('Newborn Cloth', 'Clothing', 7500),
  item('Romper', 'Clothing', 8000),
  item('Silicon Bib', 'Feeding', 3500),
  item('Breast Pump (Manual)', 'Feeding', 18000),
  item('Milk Dispenser (Plastic)', 'Feeding', 6500),
  item('Silicon Brush', 'Bath & Hygiene', 2200),
  item('Wooden Brush', 'Bath & Hygiene', 2800),
  item('Medicine Feeder', 'Feeding', 2500),
  item('Flask', 'On-the-go', 8500),
  item('Wipes (Small)', 'Diapering', 1500),
  item('Diapers (Small)', 'Diapering', 6500),
  item('Diapers (Medium)', 'Diapering', 6500),
  item('Wipes (Medium)', 'Diapering', 1800),
  item('Glass Cup with Straw', 'Feeding', 3500),
  item('Kettle Jug', 'On-the-go', 9000),
  item('Laundry Bag', 'Nursery & Sleep', 4500),
  item('Nightwear', 'Clothing', 6500),
  item('Nightwear (Big)', 'Clothing', 7500),
];

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

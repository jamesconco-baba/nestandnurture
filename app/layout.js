import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../context/CartContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
});

export const metadata = {
  title: 'Nest & Nurture — Mystery Scoop Baby Gifts',
  description:
    'Curated baby & new-mum gifting — unit shop, build-a-gift packs and signature Mystery Scoop tiers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-body bg-cream text-charcoal min-h-screen flex flex-col">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

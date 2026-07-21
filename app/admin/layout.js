export const metadata = {
  title: 'Admin — Nest & Nurture',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <div className="min-h-screen bg-cream font-body">{children}</div>;
}

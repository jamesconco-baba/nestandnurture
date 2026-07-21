import Header from '../../components/Header';
import Footer from '../../components/Footer';
import VisitTracker from '../../components/VisitTracker';

export default function SiteLayout({ children }) {
  return (
    <>
      <VisitTracker />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

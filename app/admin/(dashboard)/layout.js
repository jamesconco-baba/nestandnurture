import AdminNav from '../../../components/admin/AdminNav';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">{children}</div>
    </div>
  );
}

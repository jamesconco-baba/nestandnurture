export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-lavender-100 bg-white p-6">
      <p className="text-xs uppercase tracking-wide text-gold-700 font-body mb-2">{label}</p>
      <p className="font-display text-3xl">{value}</p>
      {hint && <p className="text-xs text-charcoal/40 font-body mt-2">{hint}</p>}
    </div>
  );
}

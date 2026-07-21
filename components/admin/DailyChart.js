export default function DailyChart({ daily }) {
  if (!daily || daily.length === 0) {
    return <p className="text-sm text-charcoal/40 font-body py-6 text-center">No data yet</p>;
  }
  const max = Math.max(...daily.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-32">
      {daily.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group">
          <div
            className="w-full rounded-t bg-lavender group-hover:bg-lavender-600 transition-colors"
            style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
            title={`${d.date}: ${d.count} visits`}
          />
          <span className="text-[9px] text-charcoal/30 font-body mt-1.5 rotate-0">
            {d.date.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

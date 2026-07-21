export default function BarList({ items, emptyLabel = 'No data yet' }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-charcoal/40 font-body py-6 text-center">{emptyLabel}</p>;
  }
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.path}>
          <div className="flex justify-between text-sm font-body mb-1">
            <span className="text-charcoal/70 truncate">{i.path}</span>
            <span className="text-charcoal/50 shrink-0 ml-3">{i.count}</span>
          </div>
          <div className="h-2 rounded-full bg-lavender-50 overflow-hidden">
            <div
              className="h-full rounded-full bg-lavender"
              style={{ width: `${Math.max(4, (i.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

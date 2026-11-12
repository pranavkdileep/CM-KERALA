// Horizontal bars drawn with plain HTML, so they are readable without scripts and scale with the page.
type Row = { name: string; total: number; resolved?: number; pending?: number; overdue?: number };

export function BarRows({ rows, label, stacked = false }: { rows: Row[]; label: string; stacked?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <ul aria-label={label} className="space-y-3">
      {rows.map((r) => (
        <li key={r.name} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,12rem)_1fr_auto]">
          <span className="truncate text-ink-soft" title={r.name}>
            {r.name}
          </span>
          <span className="flex h-3 overflow-hidden rounded-full bg-line-soft" aria-hidden="true">
            {stacked && r.resolved !== undefined ? (
              <>
                <span className="h-full bg-sage" style={{ width: `${(r.resolved / max) * 100}%` }} />
                <span className="h-full bg-navy" style={{ width: `${(((r.pending ?? 0) - (r.overdue ?? 0)) / max) * 100}%` }} />
                <span className="h-full bg-warning" style={{ width: `${((r.overdue ?? 0) / max) * 100}%` }} />
              </>
            ) : (
              <span className="h-full bg-navy" style={{ width: `${(r.total / max) * 100}%` }} />
            )}
          </span>
          <span className="w-8 text-right font-medium tabular-nums">{r.total}</span>
        </li>
      ))}
    </ul>
  );
}

export function Legend({ items }: { items: { label: string; className: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${i.className}`} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

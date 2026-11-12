import Link from "next/link";

export function Pagination({ page, pages, total, params, basePath }: { page: number; pages: number; total: number; params: Record<string, string | undefined>; basePath: string }) {
  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    q.set("page", String(p));
    return `${basePath}?${q.toString()}`;
  };
  const link = "rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium hover:border-navy";
  return (
    <nav aria-label="Pages" className="mt-6 flex items-center justify-between gap-4 text-sm text-ink-soft">
      <p>
        Page {page} of {pages}, {total} {total === 1 ? "grievance" : "grievances"}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={link}>
            Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={href(page + 1)} className={link}>
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

import type { ReactNode } from "react";
import { container } from "@/lib/ui";

export function PortalPage({ children }: { children: ReactNode }) {
  return <div className={`${container} py-10 sm:py-14`}>{children}</div>;
}

export function PortalHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.015em] sm:text-[2rem]">{title}</h1>
        {description ? <p className="mt-2 leading-relaxed text-ink-soft">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

export function Panel({ title, description, children, className = "", id }: { title?: string; description?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={`scroll-mt-28 rounded-lg border border-line bg-surface ${className}`}>
      {title ? (
        <div className="border-b border-line-soft px-5 py-4 sm:px-6">
          <h2 id={id ? `${id}-title` : undefined} className="text-base font-semibold">
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
        </div>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

const tones = {
  default: "text-navy",
  warning: "text-warning-ink",
  error: "text-error-ink",
  success: "text-success-ink",
} as const;

export function StatCard({ label, value, note, tone = "default" }: { label: string; value: string | number; note?: string; tone?: keyof typeof tones }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className={`mt-1 font-display text-3xl font-semibold tabular-nums ${tones[tone]}`}>{value}</p>
      {note ? <p className="mt-1 text-xs text-slate">{note}</p> : null}
    </div>
  );
}

export function Facts({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
      {items.map((i) => (
        <div key={i.label}>
          <dt className="text-xs text-slate">{i.label}</dt>
          <dd className="mt-0.5 font-medium text-navy">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{children}</div> : null}
    </div>
  );
}

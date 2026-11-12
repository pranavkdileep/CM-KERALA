import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { BarRows, Legend } from "@/components/charts";
import { GrievanceTable } from "@/components/grievance-table";
import { Pagination } from "@/components/pagination";
import { EmptyState, Panel, PortalHeader, PortalPage, StatCard } from "@/components/portal";
import { api } from "@/lib/api";
import { handleAuthError, requireUser } from "@/lib/dal";
import { categories, districts, priorities, statuses } from "@/lib/site";
import type { DepartmentSummary, GrievanceItem, Page, Stats } from "@/lib/types";
import { button } from "@/lib/ui";

export const metadata: Metadata = { title: "CMO dashboard", robots: { index: false } };

const FILTERS = ["district", "category", "priority", "status", "department", "q", "overdue", "awaitingReview", "escalated", "reopenRequested"] as const;

const selectCls = "h-[42px] w-full rounded-lg border border-line bg-surface px-3 text-sm text-navy hover:border-navy focus:border-navy focus:outline-none";

function FilterSelect({ name, label, value, options }: { name: string; label: string; value?: string; options: readonly (string | { value: string; label: string })[] }) {
  return (
    <div>
      <label htmlFor={`flt-${name}`} className="mb-1 block text-xs font-medium text-slate">
        {label}
      </label>
      <select id={`flt-${name}`} name={name} defaultValue={value ?? ""} className={selectCls}>
        <option value="">All</option>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default async function CmoDashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser("cmo", "/cmo");
  const raw = await searchParams;
  const params: Record<string, string | undefined> = {};
  for (const key of [...FILTERS, "page"]) {
    const v = raw[key];
    if (typeof v === "string" && v) params[key] = v;
  }

  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  const [stats, list, departments] = await Promise.all([
    api<Stats>("/api/cmo/stats"),
    api<Page<GrievanceItem>>(`/api/cmo/grievances${qs ? `?${qs}` : ""}`),
    api<{ items: DepartmentSummary[] }>("/api/departments", { auth: false }),
  ]).catch((e) => handleAuthError(e, "/cmo"));

  const t = stats.totals;
  const attention = [
    { label: "Reports waiting for review", value: t.awaitingReview, href: "/cmo?awaitingReview=true#grievances" },
    { label: "Overdue grievances", value: t.overdue, href: "/cmo?overdue=true#grievances" },
    { label: "Citizens asking to reopen", value: t.reopenRequested, href: "/cmo?reopenRequested=true#grievances" },
    { label: "Not yet assigned", value: t.unassigned, href: "/cmo?status=Submitted#grievances" },
    { label: "Escalated", value: t.escalated, href: "/cmo?escalated=true#grievances" },
  ];
  const statusRows = statuses.map((s) => ({ name: s, total: stats.byStatus[s] ?? 0 }));
  const filtered = Object.keys(params).some((k) => k !== "page");

  return (
    <PortalPage>
      <PortalHeader title="Chief Minister's Office dashboard" description="Review grievances, forward them to departments, follow their action and close them." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total grievances" value={t.total} />
        <StatCard label="Pending" value={t.pending} tone="warning" note="Not yet resolved" />
        <StatCard label="Resolved" value={t.resolved} tone="success" note={stats.averageResolutionDays !== null ? `Average ${stats.averageResolutionDays} days to resolve` : undefined} />
        <StatCard label="Overdue" value={t.overdue} tone={t.overdue > 0 ? "error" : "default"} note="Past the 30 day deadline" />
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Needs attention">
        {attention.map((a) => (
          <li key={a.label}>
            <Link href={a.href} className="flex h-full items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm hover:border-navy">
              <span className="text-ink-soft">{a.label}</span>
              <span className="font-display text-lg font-semibold tabular-nums">{a.value}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="By status">
          <BarRows rows={statusRows} label="Grievances by status" />
        </Panel>
        <Panel title="By department" description="Resolved, pending and overdue grievances per department.">
          <div className="mb-4">
            <Legend items={[{ label: "Resolved", className: "bg-sage" }, { label: "Pending", className: "bg-navy" }, { label: "Overdue", className: "bg-warning" }]} />
          </div>
          {stats.byDepartment.length > 0 ? <BarRows rows={stats.byDepartment} label="Grievances by department" stacked /> : <p className="text-sm text-slate">No grievances have been forwarded yet.</p>}
        </Panel>
      </div>

      <Panel title="By district" className="mt-6" description="Every district with its grievance counts.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">Grievances by district</caption>
            <thead className="text-xs text-slate">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">District</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Total</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Resolved</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Pending</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Overdue</th>
                <th scope="col" className="py-2 pl-4 font-medium"><span className="sr-only">Share resolved</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {stats.byDistrict.map((d) => (
                <tr key={d.name}>
                  <th scope="row" className="py-2.5 pr-4 font-medium">
                    <Link href={`/cmo?district=${encodeURIComponent(d.name)}#grievances`} className="hover:text-sage-deep">
                      {d.name}
                    </Link>
                  </th>
                  <td className="px-4 py-2.5 text-right tabular-nums">{d.total}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{d.resolved}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{d.pending}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${d.overdue > 0 ? "font-medium text-error-ink" : ""}`}>{d.overdue}</td>
                  <td className="w-32 py-2.5 pl-4" aria-hidden="true">
                    <span className="flex h-2 overflow-hidden rounded-full bg-line-soft">
                      <span className="bg-sage" style={{ width: `${d.total ? (d.resolved / d.total) * 100 : 0}%` }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <section id="grievances" aria-labelledby="all-title" className="mt-12 scroll-mt-28">
        <h2 id="all-title" className="text-xl font-semibold">
          All grievances
        </h2>

        <Form action="/cmo" className="mt-4 rounded-lg border border-line bg-surface p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label htmlFor="flt-q" className="mb-1 block text-xs font-medium text-slate">Search reference or subject</label>
              <input id="flt-q" name="q" defaultValue={params.q ?? ""} placeholder="CMK-2026 or a few words" className={`${selectCls} placeholder:text-mist`} />
            </div>
            <FilterSelect name="status" label="Status" value={params.status} options={statuses} />
            <FilterSelect name="priority" label="Priority" value={params.priority} options={priorities} />
            <FilterSelect name="district" label="District" value={params.district} options={districts} />
            <FilterSelect name="category" label="Category" value={params.category} options={categories} />
            <FilterSelect name="department" label="Department" value={params.department} options={departments.items.map((d) => ({ value: d.id, label: d.name }))} />
            <div className="flex items-end gap-4 pb-2.5 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="overdue" value="true" defaultChecked={params.overdue === "true"} className="size-[18px] accent-navy" />
                Overdue only
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className={button("primary", "md")}>Apply filters</button>
            {filtered ? (
              <Link href="/cmo#grievances" className={button("ghost", "md")}>
                Clear filters
              </Link>
            ) : null}
          </div>
        </Form>

        <div className="mt-6">
          {list.items.length === 0 ? (
            <EmptyState title="No grievances match these filters">
              <p>Try removing a filter or searching for a different word.</p>
            </EmptyState>
          ) : (
            <>
              <GrievanceTable items={list.items} hrefBase="/cmo/grievances" showCitizen />
              <Pagination page={list.page} pages={list.pages} total={list.total} params={params} basePath="/cmo" />
            </>
          )}
        </div>
      </section>
    </PortalPage>
  );
}

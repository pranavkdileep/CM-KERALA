import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { GrievanceTable } from "@/components/grievance-table";
import { Pagination } from "@/components/pagination";
import { EmptyState, PortalHeader, PortalPage, StatCard } from "@/components/portal";
import { api } from "@/lib/api";
import { handleAuthError, requireUser } from "@/lib/dal";
import { statuses } from "@/lib/site";
import type { GrievanceItem, Page, Stats } from "@/lib/types";
import { button } from "@/lib/ui";

export const metadata: Metadata = { title: "Officer dashboard", robots: { index: false } };

const selectCls = "h-[42px] w-full rounded-lg border border-line bg-surface px-3 text-sm text-navy hover:border-navy focus:border-navy focus:outline-none";

export default async function OfficerDashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser("officer", "/officer");
  const raw = await searchParams;
  const params: Record<string, string | undefined> = {};
  for (const key of ["status", "q", "overdue", "page"]) {
    const v = raw[key];
    if (typeof v === "string" && v) params[key] = v;
  }
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();

  const [stats, list] = await Promise.all([
    api<Stats>("/api/officer/stats"),
    api<Page<GrievanceItem>>(`/api/officer/grievances${qs ? `?${qs}` : ""}`),
  ]).catch((e) => handleAuthError(e, "/officer"));

  const t = stats.totals;
  const filtered = Object.keys(params).some((k) => k !== "page");

  return (
    <PortalPage>
      <PortalHeader
        title={stats.department?.name ?? "Department"}
        description={`Signed in as ${user.name}${user.designation ? `, ${user.designation}` : ""}. These are the grievances the CMO has forwarded to your department.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Forwarded to us" value={t.total} />
        <StatCard label="Needs action" value={t.pending - t.awaitingReview} tone="warning" note="In progress or reopened" />
        <StatCard label="With the CMO for review" value={t.awaitingReview} note="Action taken report submitted" />
        <StatCard label="Resolved" value={t.resolved} tone="success" />
      </div>
      {t.overdue > 0 ? (
        <p className="mt-4 rounded-lg bg-error/[0.08] px-4 py-3 text-sm text-error-ink">
          {t.overdue} {t.overdue === 1 ? "grievance is" : "grievances are"} past the 30 day deadline.{" "}
          <Link href="/officer?overdue=true" className="font-medium underline underline-offset-4">
            Show them
          </Link>
        </p>
      ) : null}

      <section aria-labelledby="list-title" className="mt-10">
        <h2 id="list-title" className="text-xl font-semibold">
          Grievances forwarded to your department
        </h2>
        <Form action="/officer" className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface p-4">
          <div className="min-w-48 flex-1">
            <label htmlFor="flt-q" className="mb-1 block text-xs font-medium text-slate">Search reference or subject</label>
            <input id="flt-q" name="q" defaultValue={params.q ?? ""} className={`${selectCls} placeholder:text-mist`} />
          </div>
          <div className="w-48">
            <label htmlFor="flt-status" className="mb-1 block text-xs font-medium text-slate">Status</label>
            <select id="flt-status" name="status" defaultValue={params.status ?? ""} className={selectCls}>
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 pb-2.5 text-sm">
            <input type="checkbox" name="overdue" value="true" defaultChecked={params.overdue === "true"} className="size-[18px] accent-navy" />
            Overdue only
          </label>
          <button type="submit" className={button("primary", "md")}>Apply filters</button>
          {filtered ? (
            <Link href="/officer" className={button("ghost", "md")}>
              Clear filters
            </Link>
          ) : null}
        </Form>

        <div className="mt-6">
          {list.items.length === 0 ? (
            <EmptyState title={filtered ? "No grievances match these filters" : "Nothing has been forwarded yet"}>
              <p>{filtered ? "Try removing a filter." : "When the CMO forwards a grievance to your department it appears here."}</p>
            </EmptyState>
          ) : (
            <>
              <GrievanceTable items={list.items} hrefBase="/officer/grievances" showDepartment={false} />
              <Pagination page={list.page} pages={list.pages} total={list.total} params={params} basePath="/officer" />
            </>
          )}
        </div>
      </section>
    </PortalPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { GrievanceTable } from "@/components/grievance-table";
import { EmptyState, PortalHeader, PortalPage, StatCard } from "@/components/portal";
import { api } from "@/lib/api";
import { handleAuthError, requireUser } from "@/lib/dal";
import type { GrievanceItem } from "@/lib/types";
import { button } from "@/lib/ui";

export const metadata: Metadata = { title: "My grievances", robots: { index: false } };

export default async function DashboardPage() {
  const user = await requireUser("citizen", "/dashboard");
  const data = await api<{ counts: { total: number; pending: number; resolved: number }; items: GrievanceItem[] }>("/api/grievances/mine").catch((e) => handleAuthError(e, "/dashboard"));

  return (
    <PortalPage>
      <PortalHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        description="Every grievance you have submitted, with its current status and the latest update from the CMO or the department."
        actions={
          <Link href="/submit" className={button("primary", "lg")}>
            Submit a grievance
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Submitted" value={data.counts.total} />
        <StatCard label="Pending" value={data.counts.pending} tone={data.counts.pending > 0 ? "warning" : "default"} note="Not yet resolved" />
        <StatCard label="Resolved" value={data.counts.resolved} tone="success" />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Previous grievances</h2>
        {data.items.length === 0 ? (
          <EmptyState title="You have not submitted a grievance yet">
            <p>When you do, it appears here with a reference number you can use to track it.</p>
            <Link href="/submit" className={`${button("primary", "md")} mt-5`}>
              Submit your first grievance
            </Link>
          </EmptyState>
        ) : (
          <GrievanceTable items={data.items} hrefBase="/dashboard" />
        )}
      </div>
    </PortalPage>
  );
}

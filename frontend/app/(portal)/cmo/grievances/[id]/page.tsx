import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AiPanel, AssignmentsPanel, DetailHeader, FilesPanel, Overview } from "@/components/grievance-detail";
import { Timeline } from "@/components/grievance-ui";
import { Panel, PortalPage } from "@/components/portal";
import { api, ApiError } from "@/lib/api";
import { handleAuthError, requireUser } from "@/lib/dal";
import type { DepartmentSummary, GrievanceDetail, SessionUser } from "@/lib/types";
import { CmoActions } from "./cmo-actions";

export const metadata: Metadata = { title: "Review grievance", robots: { index: false } };

export default async function CmoGrievancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = `/cmo/grievances/${id}`;
  await requireUser("cmo", path);

  let g: GrievanceDetail;
  let departments: DepartmentSummary[];
  let officers: SessionUser[];
  try {
    [g, departments, officers] = await Promise.all([
      api<{ grievance: GrievanceDetail }>(`/api/grievances/${id}`).then((r) => r.grievance),
      api<{ items: DepartmentSummary[] }>("/api/departments", { auth: false }).then((r) => r.items),
      api<{ items: SessionUser[] }>("/api/cmo/officers").then((r) => r.items),
    ]);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    handleAuthError(err, path);
  }

  const pendingReport = g.assignments.find((a) => a.state === "active" && a.actionReport?.reviewStatus === "pending")?.actionReport ?? null;

  return (
    <PortalPage>
      <p className="mb-4 text-sm">
        <Link href="/cmo#grievances" className="font-medium text-sage-deep underline underline-offset-4">
          All grievances
        </Link>
      </p>
      <DetailHeader g={g} />

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Overview g={g} showCitizen />
          <AiPanel g={g} />
          <AssignmentsPanel g={g} />
          <Panel title="History" description="Every change with who made it and when. Internal entries are never shown to the citizen.">
            <Timeline entries={g.history} showVisibility />
          </Panel>
        </div>
        <div className="space-y-6">
          <CmoActions
            grievance={{
              id: g.id,
              status: g.status,
              category: g.category,
              priority: g.priority,
              isOverdue: g.isOverdue,
              departmentId: g.department?.id ?? "",
              suggestedDepartment: g.ai?.departmentName ?? "",
              allowedStatuses: g.allowedStatuses,
              resolved: g.status === "Resolved",
            }}
            departments={departments}
            officers={officers.map((o) => ({ id: o.id, name: o.name, departmentId: o.department?.id ?? "" }))}
            pendingReport={pendingReport ? { summary: pendingReport.summary, details: pendingReport.details } : null}
          />
          <FilesPanel g={g} />
        </div>
      </div>
    </PortalPage>
  );
}

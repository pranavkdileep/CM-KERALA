import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignmentsPanel, DetailHeader, FilesPanel, Overview } from "@/components/grievance-detail";
import { AiSummary, Timeline } from "@/components/grievance-ui";
import { Panel, PortalPage } from "@/components/portal";
import { api, ApiError } from "@/lib/api";
import { handleAuthError, requireUser } from "@/lib/dal";
import type { GrievanceDetail } from "@/lib/types";
import { OfficerActions } from "./officer-actions";

export const metadata: Metadata = { title: "Grievance for action", robots: { index: false } };

export default async function OfficerGrievancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = `/officer/grievances/${id}`;
  await requireUser("officer", path);

  let g: GrievanceDetail;
  try {
    g = (await api<{ grievance: GrievanceDetail }>(`/api/grievances/${id}`)).grievance;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    handleAuthError(err, path);
  }

  const active = g.assignments.find((a) => a.state === "active");
  const canAct = g.status === "In Progress" || g.status === "Reopened";
  const waiting = g.actionReportStatus === "pending";

  return (
    <PortalPage>
      <p className="mb-4 text-sm">
        <Link href="/officer" className="font-medium text-sage-deep underline underline-offset-4">
          All grievances for the department
        </Link>
      </p>
      <DetailHeader g={g} />

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          {active?.instructions ? (
            <Panel title="CMO instructions">
              <p className="text-sm leading-relaxed text-ink-soft">{active.instructions}</p>
            </Panel>
          ) : null}
          <Overview g={g} showCitizen={false} />
          {g.ai ? (
            <Panel title="AI assistant summary">
              <AiSummary ai={g.ai} audience="staff" />
            </Panel>
          ) : null}
          <AssignmentsPanel g={g} />
          <Panel title="History" description="Internal entries are visible to the CMO and your department only.">
            <Timeline entries={g.history} showVisibility />
          </Panel>
        </div>
        <div className="space-y-6">
          <OfficerActions grievanceId={g.id} canAct={canAct} waiting={waiting} status={g.status} reportRejected={g.actionReportStatus === "rejected"} />
          <FilesPanel g={g} />
        </div>
      </div>
    </PortalPage>
  );
}

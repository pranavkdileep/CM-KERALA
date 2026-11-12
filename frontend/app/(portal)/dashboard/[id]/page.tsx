import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { AiSummary, AttachmentList, OverdueFlag, PriorityChip, RefNumber, Timeline } from "@/components/grievance-ui";
import { Facts, Panel, PortalPage } from "@/components/portal";
import { StatusChip } from "@/components/status-chip";
import { api, ApiError } from "@/lib/api";
import { handleAuthError, requireUser } from "@/lib/dal";
import { formatDate, formatDateTime } from "@/lib/format";
import type { GrievanceDetail } from "@/lib/types";
import { notFound } from "next/navigation";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = { title: "Grievance details", robots: { index: false } };

export default async function GrievancePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const { submitted } = await searchParams;
  await requireUser("citizen", `/dashboard/${id}`);

  let g: GrievanceDetail;
  try {
    g = (await api<{ grievance: GrievanceDetail }>(`/api/grievances/${id}`)).grievance;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    handleAuthError(err, `/dashboard/${id}`);
  }

  return (
    <PortalPage>
      <p className="mb-4 text-sm">
        <Link href="/dashboard" className="font-medium text-sage-deep underline underline-offset-4">
          All my grievances
        </Link>
      </p>

      {submitted === "1" ? (
        <div role="status" className="mb-8 flex gap-3 rounded-lg bg-success/[0.08] px-5 py-4 text-success-ink">
          <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Your grievance has been submitted</p>
            <p className="mt-1 text-sm">
              Your reference number is <span className="font-mono font-semibold">{g.referenceId}</span>. Keep it to track progress at any time.
            </p>
          </div>
        </div>
      ) : null}

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <RefNumber value={g.referenceId} />
          <StatusChip status={g.status} />
          {g.isOverdue ? <OverdueFlag /> : null}
        </div>
        <h1 className="mt-3 max-w-3xl text-[1.75rem] leading-tight font-bold tracking-[-0.015em]">{g.subject}</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Panel title="Your grievance">
            <Facts
              items={[
                { label: "District", value: g.district },
                { label: "Category", value: g.category },
                { label: "Priority", value: <PriorityChip priority={g.priority} /> },
                { label: "Department", value: g.department?.name ?? "Not assigned yet" },
                { label: "Submitted", value: formatDate(g.createdAt) },
                { label: "Target date", value: formatDate(g.dueDate) },
              ]}
            />
            <p className="mt-6 text-sm leading-relaxed whitespace-pre-line text-ink-soft">{g.description}</p>
          </Panel>

          {g.resolution ? (
            <Panel title="Resolution">
              <p className="leading-relaxed text-ink-soft">{g.resolution.summary}</p>
              <p className="mt-2 text-xs text-slate">Resolved on {formatDateTime(g.resolution.resolvedAt)}</p>
            </Panel>
          ) : null}

          {g.canGiveFeedback ? (
            <Panel title="Was the problem fixed?" description="Your feedback goes to the CMO. If it is not fixed, the CMO can reopen the grievance.">
              <FeedbackForm grievanceId={g.id} />
            </Panel>
          ) : null}

          {g.feedback.length > 0 ? (
            <Panel title="Your feedback">
              <ul className="space-y-3 text-sm">
                {g.feedback.map((f) => (
                  <li key={f.id}>
                    <p className="font-medium">
                      {f.rating} of 5, {f.satisfied ? "satisfied" : "not satisfied"}
                    </p>
                    {f.comment ? <p className="mt-0.5 text-ink-soft">{f.comment}</p> : null}
                    <p className="mt-0.5 text-xs text-slate">{formatDateTime(f.createdAt)}</p>
                  </li>
                ))}
              </ul>
              {g.reopenRequested ? <p className="mt-4 text-sm text-ink-soft">You asked for this grievance to be reopened. The CMO will review it.</p> : null}
            </Panel>
          ) : null}

          <Panel title="Updates" description="Every change and every remark from the CMO or the department.">
            <Timeline entries={g.history} />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Files you attached">
            <AttachmentList items={g.attachments} />
          </Panel>
          {g.ai ? (
            <Panel title="AI assistant">
              <AiSummary ai={g.ai} audience="citizen" />
            </Panel>
          ) : null}
        </div>
      </div>
    </PortalPage>
  );
}

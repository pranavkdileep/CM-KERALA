import { AiSummary, AttachmentList, OverdueFlag, PriorityChip, RefNumber } from "@/components/grievance-ui";
import { Facts, Panel } from "@/components/portal";
import { StatusChip } from "@/components/status-chip";
import { formatDate, formatDateTime } from "@/lib/format";
import type { GrievanceDetail } from "@/lib/types";

export function DetailHeader({ g }: { g: GrievanceDetail }) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <RefNumber value={g.referenceId} />
        <StatusChip status={g.status} />
        <PriorityChip priority={g.priority} />
        {g.isOverdue ? <OverdueFlag /> : null}
        {g.escalationLevel > 0 ? <span className="rounded bg-warning/[0.1] px-2.5 py-1 text-xs font-medium tracking-[0.5px] text-warning-ink uppercase">Escalated, level {g.escalationLevel}</span> : null}
        {g.reopenRequested ? <span className="rounded bg-error/[0.08] px-2.5 py-1 text-xs font-medium tracking-[0.5px] text-error-ink uppercase">Citizen wants reopening</span> : null}
      </div>
      <h1 className="mt-3 max-w-3xl text-[1.75rem] leading-tight font-bold tracking-[-0.015em]">{g.subject}</h1>
    </header>
  );
}

export function Overview({ g, showCitizen }: { g: GrievanceDetail; showCitizen: boolean }) {
  return (
    <Panel title="Grievance">
      <Facts
        items={[
          { label: "District", value: g.district },
          { label: "Category", value: g.category },
          { label: "Department", value: g.department?.name ?? "Not assigned" },
          { label: "Officer", value: g.officer?.name ?? "Not assigned" },
          { label: "Submitted", value: formatDate(g.createdAt) },
          { label: "Due", value: formatDate(g.dueDate) },
          ...(showCitizen && g.citizen
            ? [
                { label: "Citizen", value: g.citizen.name },
                { label: "Email", value: g.citizen.email },
                { label: "Mobile", value: g.citizen.mobile ?? "Not given" },
              ]
            : []),
        ]}
      />
      <p className="mt-6 text-sm leading-relaxed whitespace-pre-line text-ink-soft">{g.description}</p>
      {g.escalation?.reason ? (
        <p className="mt-5 rounded-lg bg-warning/[0.1] px-4 py-3 text-sm text-warning-ink">
          Escalated to level {g.escalation.level}
          {g.escalation.at ? ` on ${formatDate(g.escalation.at)}` : ""}: {g.escalation.reason}
        </p>
      ) : null}
    </Panel>
  );
}

export function AiPanel({ g }: { g: GrievanceDetail }) {
  if (!g.ai) return null;
  return (
    <Panel title="AI assistant review" description="Advice only. Check it against the complaint before acting.">
      <AiSummary ai={g.ai} audience="staff" />
      {g.ai.duplicates.length > 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          Possible duplicates flagged for a person to check: <span className="font-mono">{g.ai.duplicates.map((d) => d.referenceId).join(", ")}</span>
        </p>
      ) : null}
    </Panel>
  );
}

export function FilesPanel({ g }: { g: GrievanceDetail }) {
  return (
    <Panel title="Attachments">
      <AttachmentList items={g.attachments} />
    </Panel>
  );
}

const reportTone = { pending: "text-info", accepted: "text-success-ink", rejected: "text-error-ink", none: "text-slate" } as const;
const reportLabel = { pending: "Waiting for CMO review", accepted: "Accepted by the CMO", rejected: "Sent back by the CMO", none: "" } as const;

export function AssignmentsPanel({ g }: { g: GrievanceDetail }) {
  if (g.assignments.length === 0) {
    return (
      <Panel title="Department assignment">
        <p className="text-sm text-slate">Not forwarded to a department yet.</p>
      </Panel>
    );
  }
  return (
    <Panel title="Department assignment and action taken">
      <ul className="space-y-5">
        {[...g.assignments].reverse().map((a) => (
          <li key={a.id} className="rounded-lg border border-line-soft p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                {a.department?.name ?? "Department"}
                {a.officer ? `, ${a.officer.name}` : ""}
              </p>
              <span className="text-xs text-slate">
                {a.state === "active" ? "Current" : a.state === "completed" ? "Completed" : "Replaced"}, forwarded {formatDateTime(a.assignedAt)}
              </span>
            </div>
            {a.instructions ? <p className="mt-2 text-sm text-ink-soft">CMO instructions: {a.instructions}</p> : null}
            {a.actionReport ? (
              <div className="mt-4 border-t border-line-soft pt-4 text-sm">
                <p className="font-medium">
                  Action taken report <span className={`ml-2 text-xs font-normal ${reportTone[a.actionReport.reviewStatus]}`}>{reportLabel[a.actionReport.reviewStatus]}</span>
                </p>
                <p className="mt-1.5 font-medium text-navy">{a.actionReport.summary}</p>
                <p className="mt-1 leading-relaxed whitespace-pre-line text-ink-soft">{a.actionReport.details}</p>
                <p className="mt-1.5 text-xs text-slate">Submitted {formatDateTime(a.actionReport.submittedAt)}</p>
                {a.actionReport.reviewRemark ? <p className="mt-2 text-xs text-slate">CMO remark: {a.actionReport.reviewRemark}</p> : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

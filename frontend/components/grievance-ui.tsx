import Link from "next/link";
import { FileText, ImageIcon } from "lucide-react";
import { StatusChip } from "@/components/status-chip";
import { formatDateTime, formatSize } from "@/lib/format";
import type { AttachmentInfo, GrievanceDetail, HistoryEntry, Priority } from "@/lib/types";

const priorityTone: Record<Priority, string> = {
  High: "bg-error/[0.08] text-error-ink",
  Medium: "bg-warning/[0.08] text-warning-ink",
  Low: "bg-line-soft text-ink-soft",
};

export function PriorityChip({ priority }: { priority: Priority }) {
  return <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-medium tracking-[0.5px] uppercase ${priorityTone[priority]}`}>{priority}</span>;
}

export function OverdueFlag() {
  return <span className="inline-flex items-center rounded bg-error/[0.08] px-2.5 py-1 text-xs font-medium tracking-[0.5px] text-error-ink uppercase">Overdue</span>;
}

export function RefNumber({ value, href }: { value: string; href?: string }) {
  const cls = "font-mono text-[13px] font-medium text-navy";
  return href ? (
    <Link href={href} className={`${cls} underline decoration-line underline-offset-4 hover:decoration-navy`}>
      {value}
    </Link>
  ) : (
    <span className={cls}>{value}</span>
  );
}

const actionLabel: Record<string, string> = {
  remark: "Update",
  assigned: "Forwarded",
  escalated: "Escalated",
  action_report: "Action report",
  report_review: "Report review",
  feedback: "Feedback",
  triage: "CMO review",
  submitted: "Submitted",
};

export function Timeline({ entries, showVisibility = false }: { entries: HistoryEntry[]; showVisibility?: boolean }) {
  return (
    <ol aria-label="History">
      {entries.map((e, i) => {
        const last = i === entries.length - 1;
        const isStatus = e.action === "status_change" || e.action === "submitted";
        return (
          <li key={e.id} className="relative grid grid-cols-[20px_1fr] gap-x-4">
            <span className="relative flex justify-center" aria-hidden="true">
              <span className={`relative z-10 mt-1.5 size-3 rounded-full ring-4 ring-surface ${isStatus ? "bg-navy" : "bg-mist"}`} />
              {!last && <span className="absolute top-3 bottom-0 w-px bg-mist/60" />}
            </span>
            <div className={last ? "" : "pb-6"}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {isStatus && e.toStatus ? <StatusChip status={e.toStatus} /> : <span className="text-sm font-medium text-navy">{actionLabel[e.action] ?? e.action}</span>}
                {showVisibility && e.visibility === "internal" ? (
                  <span className="rounded border border-line px-2 py-0.5 text-xs text-slate">Internal</span>
                ) : null}
                <time dateTime={e.at} className="text-xs text-slate">
                  {formatDateTime(e.at)}
                </time>
              </div>
              {e.remark ? <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{e.remark}</p> : null}
              <p className="mt-1 text-xs text-slate">{e.actorName}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function AttachmentList({ items }: { items: AttachmentInfo[] }) {
  if (items.length === 0) return <p className="text-sm text-slate">No files attached.</p>;
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li key={a.id}>
          <a
            href={`/files/${a.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-line px-3.5 py-2.5 text-sm hover:border-navy"
          >
            {a.mimeType === "application/pdf" ? <FileText className="size-5 text-slate" aria-hidden="true" /> : <ImageIcon className="size-5 text-slate" aria-hidden="true" />}
            <span className="min-w-0 flex-1 truncate font-medium text-navy">{a.name}</span>
            <span className="text-xs text-slate">
              {a.kind === "action_report" ? "Action report, " : ""}
              {formatSize(a.size)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

// The assistant's output, always labelled with where it came from. It is advice, not a decision.
export function AiSummary({ ai, audience }: { ai: NonNullable<GrievanceDetail["ai"]>; audience: "citizen" | "staff" }) {
  const fallback = ai.source === "fallback";
  return (
    <div className="rounded-lg bg-line-soft/70 p-4 text-sm">
      <p className="font-medium text-navy">{fallback ? "Keyword summary (AI service was not used)" : `AI summary (${ai.model})`}</p>
      <p className="mt-1.5 leading-relaxed text-ink-soft">{ai.summary}</p>
      <p className="mt-3 text-xs leading-relaxed text-slate">
        Suggested category: {ai.category}. Suggested department: {ai.departmentName ?? "none"}. Suggested priority: {ai.priority}.
        {audience === "staff" && ai.citizenOverrode ? " The citizen chose a different category." : ""} These are suggestions. The Chief Minister&apos;s Office makes the decision.
      </p>
    </div>
  );
}

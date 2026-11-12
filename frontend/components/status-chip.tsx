export type GrievanceStatus = "Submitted" | "Under Review" | "In Progress" | "Resolved" | "Reopened";

const tones: Record<GrievanceStatus, string> = {
  Submitted: "bg-line-soft text-ink-soft",
  "Under Review": "bg-warning/[0.08] text-warning-ink",
  "In Progress": "bg-info/[0.08] text-[#0369a1]",
  Resolved: "bg-success/[0.08] text-success-ink",
  Reopened: "bg-error/[0.08] text-error-ink",
};

// Chip style per DESIGN.md: 12px, medium, uppercase with light tracking. Used only for workflow statuses.
export function StatusChip({ status }: { status: GrievanceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-3 py-1 text-xs font-medium tracking-[0.5px] uppercase ${tones[status]}`}
    >
      {status}
    </span>
  );
}

import { OverdueFlag, PriorityChip, RefNumber } from "@/components/grievance-ui";
import { StatusChip } from "@/components/status-chip";
import { formatDate } from "@/lib/format";
import type { GrievanceItem } from "@/lib/types";

export function GrievanceTable({ items, hrefBase, showDepartment = true, showCitizen = false }: { items: GrievanceItem[]; hrefBase: string; showDepartment?: boolean; showCitizen?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[860px] text-left text-sm">
        <caption className="sr-only">Grievances</caption>
        <thead className="border-b border-line bg-page text-xs text-slate">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Reference</th>
            <th scope="col" className="px-4 py-3 font-medium">Subject</th>
            <th scope="col" className="px-4 py-3 font-medium">District</th>
            <th scope="col" className="px-4 py-3 font-medium">Priority</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            {showDepartment ? <th scope="col" className="px-4 py-3 font-medium">Department</th> : null}
            <th scope="col" className="px-4 py-3 font-medium">Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {items.map((g) => (
            <tr key={g.id} className="hover:bg-page">
              <td className="px-4 py-3.5 align-top whitespace-nowrap">
                <RefNumber value={g.referenceId} href={`${hrefBase}/${g.id}`} />
              </td>
              <td className="max-w-[22rem] px-4 py-3.5 align-top">
                <p className="font-medium text-navy">{g.subject}</p>
                <p className="mt-0.5 text-xs text-slate">
                  {g.category}
                  {showCitizen && g.citizenName ? `, ${g.citizenName}` : ""}
                </p>
                {g.escalationLevel > 0 || g.reopenRequested || g.actionReportStatus === "pending" ? (
                  <p className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    {g.escalationLevel > 0 ? <span className="rounded bg-warning/[0.1] px-1.5 py-0.5 text-warning-ink">Escalated</span> : null}
                    {g.reopenRequested ? <span className="rounded bg-error/[0.08] px-1.5 py-0.5 text-error-ink">Citizen wants reopening</span> : null}
                    {g.actionReportStatus === "pending" ? <span className="rounded bg-info/[0.1] px-1.5 py-0.5 text-[#0369a1]">Report to review</span> : null}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3.5 align-top whitespace-nowrap text-ink-soft">{g.district}</td>
              <td className="px-4 py-3.5 align-top">
                <PriorityChip priority={g.priority} />
              </td>
              <td className="px-4 py-3.5 align-top">
                <StatusChip status={g.status} />
              </td>
              {showDepartment ? <td className="px-4 py-3.5 align-top text-ink-soft">{g.department?.name ?? <span className="text-slate">Not assigned</span>}</td> : null}
              <td className="px-4 py-3.5 align-top whitespace-nowrap">
                <span className="text-ink-soft">{formatDate(g.dueDate)}</span>
                {g.isOverdue ? (
                  <span className="mt-1 block">
                    <OverdueFlag />
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

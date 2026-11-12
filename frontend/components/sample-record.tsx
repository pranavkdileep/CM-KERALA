import type { CSSProperties } from "react";
import { StatusChip, type GrievanceStatus } from "@/components/status-chip";

type Step = { status: GrievanceStatus; when: string; note: string };

const history: Step[] = [
  { status: "Submitted", when: "12 Oct 2026, 9:14 am", note: "Reference number issued to the citizen." },
  { status: "Under Review", when: "13 Oct 2026, 11:02 am", note: "CMO desk confirmed the suggested department." },
  {
    status: "In Progress",
    when: "15 Oct 2026, 4:40 pm",
    note: "Forwarded to Kottayam Municipality. Site inspection on 17 Oct.",
  },
  { status: "Resolved", when: "21 Oct 2026, 2:05 pm", note: "14 streetlights replaced. Action report accepted by the CMO." },
];

const details = [
  { label: "District", value: "Kottayam" },
  { label: "Department", value: "Local Self Government" },
  { label: "Priority", value: "Medium" },
];

// A fictional grievance record that shows what citizens see when they track a reference number.
export function SampleRecord() {
  return (
    <figure className="rounded-2xl border border-line bg-surface shadow-panel">
      <div className="border-b border-line-soft px-6 pt-5 pb-5 sm:px-7">
        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-sm text-slate">Sample tracking record</span>
          <span className="font-mono text-sm font-medium text-navy">CMK-2026-004817</span>
        </figcaption>
        <p className="mt-3 font-display text-lg leading-snug font-semibold text-navy">
          Streetlights out along MC Road near Kodimatha for three weeks
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-xs text-slate">{d.label}</dt>
              <dd className="mt-0.5 font-medium text-navy">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ol className="px-6 py-5 sm:px-7" aria-label="Status history">
        {history.map((step, i) => {
          const last = i === history.length - 1;
          return (
            <li
              key={step.status}
              className="record-step relative grid grid-cols-[20px_1fr] gap-x-4"
              style={{ "--step": i } as CSSProperties}
            >
              <span className="relative flex justify-center" aria-hidden="true">
                <span
                  className={`relative z-10 mt-1.5 size-3 rounded-full ring-4 ring-surface ${
                    last ? "bg-sage" : "bg-navy"
                  }`}
                />
                {!last && <span className="absolute top-3 bottom-0 w-px bg-mist/60" />}
              </span>
              <div className={last ? "" : "pb-5"}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusChip status={step.status} />
                  <time className="text-xs text-slate">{step.when}</time>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.note}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

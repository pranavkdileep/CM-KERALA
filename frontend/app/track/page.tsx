import type { Metadata } from "next";
import Link from "next/link";
import { OverdueFlag } from "@/components/grievance-ui";
import { PageIntro } from "@/components/page-intro";
import { StatusChip } from "@/components/status-chip";
import { TrackForm } from "@/components/track-form";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import type { TrackResult } from "@/lib/types";
import { container, textLink } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Track a grievance",
  description: "Enter a reference number to see the current status, the department handling it and every status change.",
  alternates: { canonical: "/track" },
};

const REF = /^CMK-\d{4}-\d{6}$/;

export default async function TrackPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ref } = await searchParams;
  const query = typeof ref === "string" ? ref.trim().toUpperCase() : "";

  let result: TrackResult | null = null;
  let problem = "";
  if (query) {
    if (!REF.test(query)) {
      problem = "Reference numbers look like CMK-2026-123456. Check the number and try again.";
    } else {
      try {
        result = await api<TrackResult>(`/api/grievances/track/${query}`, { auth: false });
      } catch (err) {
        if (!(err instanceof ApiError)) throw err;
        problem = err.status === 404 ? "No grievance found with that reference number. Check the number and try again." : err.message;
      }
    }
  }

  return (
    <>
      <PageIntro title="Track a grievance">
        <p>Enter the reference number you received when you submitted. You will see the current status, the department handling it and each change so far.</p>
      </PageIntro>

      <div className={`${container} py-12 sm:py-16`}>
        <TrackForm id="track-page" />

        {problem ? (
          <p role="alert" className="mt-6 max-w-xl rounded-lg bg-error/[0.08] px-4 py-3 text-sm text-error-ink">
            {problem}
          </p>
        ) : null}

        {result ? (
          <section aria-labelledby="result-title" className="mt-10 max-w-3xl rounded-lg border border-line bg-surface">
            <div className="border-b border-line-soft p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 id="result-title" className="font-mono text-lg font-semibold">
                  {result.referenceId}
                </h2>
                <StatusChip status={result.status} />
                {result.isOverdue ? <OverdueFlag /> : null}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-slate">Department</dt>
                  <dd className="mt-0.5 font-medium">{result.department ?? "Not assigned yet"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate">District</dt>
                  <dd className="mt-0.5 font-medium">{result.district}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate">Submitted</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(result.submittedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate">Last update</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(result.updatedAt)}</dd>
                </div>
              </dl>
            </div>

            <ol className="p-6" aria-label="Status history">
              {result.history.map((h, i) => {
                const last = i === result.history.length - 1;
                return (
                  <li key={`${h.at}-${i}`} className="relative grid grid-cols-[20px_1fr] gap-x-4">
                    <span className="relative flex justify-center" aria-hidden="true">
                      <span className={`relative z-10 mt-1.5 size-3 rounded-full ring-4 ring-surface ${last ? "bg-sage" : "bg-navy"}`} />
                      {!last && <span className="absolute top-3 bottom-0 w-px bg-mist/60" />}
                    </span>
                    <div className={last ? "" : "pb-5"}>
                      <p className="text-sm font-medium text-navy">{h.title}</p>
                      <time dateTime={h.at} className="text-xs text-slate">
                        {formatDateTime(h.at)}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="border-t border-line-soft px-6 py-4 text-xs leading-relaxed text-slate">
              Remarks and personal details are only shown to the person who submitted the grievance.{" "}
              <Link href="/login" className={textLink}>
                Sign in
              </Link>{" "}
              to see the full updates.
            </p>
          </section>
        ) : null}
      </div>
    </>
  );
}

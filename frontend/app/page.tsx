import type { Metadata } from "next";
import Link from "next/link";
import { CookieConsent } from "@/components/cookie-consent";
import { JsonLd } from "@/components/json-ld";
import { SampleRecord } from "@/components/sample-record";
import { TrackForm } from "@/components/track-form";
import { featuredDepartments, departments } from "@/lib/departments";
import { routes, site } from "@/lib/site";
import { button, container, textLink } from "@/lib/ui";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Sample figures for demonstration only.
const statusTotals = [
  { status: "Resolved", count: 18412, color: "bg-sage" },
  { status: "In Progress", count: 3906, color: "bg-navy" },
  { status: "Under Review", count: 1288, color: "bg-slate" },
  { status: "Submitted", count: 744, color: "bg-mist" },
  { status: "Reopened", count: 312, color: "bg-warning" },
];
const totalReceived = statusTotals.reduce((sum, s) => sum + s.count, 0);
const fmt = new Intl.NumberFormat("en-IN");

const steps = [
  { title: "You submit", text: "Describe the problem and get a reference number straight away." },
  { title: "CMO reviews", text: "Staff at the Chief Minister's Office check the details and priority." },
  { title: "Department assigned", text: "The grievance is forwarded to the department and officer responsible." },
  { title: "Action taken", text: "The officer investigates, acts and files an action taken report." },
  { title: "Resolved", text: "The CMO accepts the report and you are told the outcome." },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          description: site.description,
          inLanguage: "en-IN",
        }}
      />

      {/* Hero: the promise (raise it, follow it) beside the record that proves it */}
      <section className="bg-surface">
        <div className={`${container} grid items-center gap-14 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24`}>
          <div>
            <h1 className="max-w-[16ch] text-[2.5rem] leading-[1.1] font-bold tracking-[-0.025em] sm:text-[3.25rem]">
              Tell the Chief Minister&apos;s Office what needs fixing.
            </h1>
            <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-ink-soft">
              Report a problem with a road, hospital, school, water supply or any other public service in Kerala.
              Your grievance is reviewed by the CMO, sent to the department responsible, and every step is recorded
              against your reference number.
            </p>
            <div className="mt-8">
              <Link href={routes.submit} className={button("primary", "lg")}>
                Submit a grievance
              </Link>
            </div>
            <div className="mt-10 border-t border-line-soft pt-8">
              <TrackForm id="hero-track" />
            </div>
          </div>
          <SampleRecord />
        </div>
      </section>

      {/* Sample statistics, shown as the workflow statuses citizens will see */}
      <section aria-labelledby="stats-title" className="border-y border-line">
        <div className={`${container} py-16 sm:py-20`}>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <h2 id="stats-title" className="text-2xl leading-tight font-semibold">
                Where this year&apos;s grievances stand
              </h2>
              <p className="mt-3 text-ink-soft">
                {fmt.format(totalReceived)} grievances received from January to October 2026.
              </p>
              <p className="mt-2 text-sm text-slate">Sample figures for demonstration.</p>
            </div>

            <div>
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-line-soft" aria-hidden="true">
                {statusTotals.map((s) => (
                  <span
                    key={s.status}
                    className={`${s.color} h-full border-r-2 border-page last:border-r-0`}
                    style={{ width: `${(s.count / totalReceived) * 100}%` }}
                  />
                ))}
              </div>
              <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
                {statusTotals.map((s) => (
                  <div key={s.status}>
                    <dt className="flex items-center gap-2 text-sm text-ink-soft">
                      <span className={`size-2.5 rounded-full ${s.color}`} aria-hidden="true" />
                      {s.status}
                    </dt>
                    <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">
                      {fmt.format(s.count)}
                      <span className="ml-1.5 font-sans text-sm font-normal text-slate">
                        {Math.round((s.count / totalReceived) * 100)}%
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-ink-soft">
                Grievances reached the CMO from all 14 districts. The average time from submission to first review
                was 3.2 days, and resolved grievances closed in 11 days on average.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured departments */}
      <section aria-labelledby="departments-title" className="bg-surface">
        <div className={`${container} py-16 sm:py-24`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <h2 id="departments-title" className="text-[1.75rem] leading-tight font-bold tracking-[-0.015em]">
                Departments that act on grievances
              </h2>
              <p className="mt-3 text-ink-soft">
                You do not need to know which department is responsible. Describe the problem and the CMO routes it.
              </p>
            </div>
            <Link href="/departments" className={textLink}>
              See all {departments.length} departments
            </Link>
          </div>

          <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDepartments.map((d) => (
              <li key={d.slug} className="border-t border-line py-7">
                <d.icon className="size-6 text-sage" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">
                  <Link href={`/departments#${d.slug}`} className="hover:text-sage-deep">
                    {d.name}
                  </Link>
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{d.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Workflow summary: a real sequence, so it is numbered */}
      <section aria-labelledby="steps-title" className="border-t border-line">
        <div className={`${container} py-16 sm:py-24`}>
          <h2 id="steps-title" className="text-[1.75rem] leading-tight font-bold tracking-[-0.015em]">
            From complaint to resolution
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {steps.map((step, i) => (
              <li key={step.title} className="relative lg:pr-2">
                <span className="flex size-8 items-center justify-center rounded-full border border-navy font-display text-sm font-semibold">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10">
            <Link href="/how-it-works" className={textLink}>
              Read the full process
            </Link>
          </p>
        </div>
      </section>

      {/* Closing prompt */}
      <section className={`${container} pb-20`}>
        <div className="grid gap-8 rounded-2xl bg-navy px-6 py-10 text-white sm:px-10 sm:py-12 md:grid-cols-[1fr_auto] md:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl leading-tight font-semibold text-white">Before you submit</h2>
            <p className="mt-3 leading-relaxed text-mist">
              Keep the exact location, the date the problem started and any earlier application or complaint number
              ready. A clear photo helps the department act faster.
            </p>
          </div>
          <Link href={routes.submit} className={button("inverse", "lg")}>
            Submit a grievance
          </Link>
        </div>
      </section>

      <CookieConsent />
    </>
  );
}

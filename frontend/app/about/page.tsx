import Link from "next/link";
import { Check } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { button, container } from "@/lib/ui";

export const metadata = pageMetadata({
  title: "About the initiative",
  description:
    "Why the CM Kerala Grievance Portal exists: its purpose, vision, mission and the objectives it is measured against.",
  path: "/about",
});

const statements = [
  {
    title: "Purpose",
    body: "People often know exactly what is wrong: a road that floods every monsoon, a pension that stopped, a health centre without a doctor. What they lack is a way to reach someone who can act, and a way to see whether anyone did. This portal gives every citizen a direct line to the Chief Minister's Office and a record of what happened next.",
  },
  {
    title: "Vision",
    body: "A Kerala where no reasonable grievance goes unanswered, and where every citizen can see who is responsible for fixing a problem and how far they have got.",
  },
  {
    title: "Mission",
    body: "To receive grievances from all 14 districts in one place, review each one at the CMO, route it to the department responsible, hold that department to a timeline and report the outcome back to the citizen in plain language.",
  },
];

const objectives = [
  "Review every grievance at the CMO within 3 working days of submission.",
  "Assign each grievance to a named department and officer, never to a general inbox.",
  "Record every status change with the time and the person who made it.",
  "Escalate grievances that remain unresolved after 30 days.",
  "Tell the citizen what action was taken, not just that the case is closed.",
  "Use district and department figures to find recurring problems and fix them at the source.",
];

export default function AboutPage() {
  return (
    <>
      <PageIntro title="One place to be heard, and to see what happens next">
        <p>
          The CM Kerala Grievance Portal connects citizens directly with the Chief Minister&apos;s Office and the
          departments that serve them.
        </p>
      </PageIntro>

      <section className={`${container} py-16 sm:py-20`}>
        <dl className="divide-y divide-line border-y border-line">
          {statements.map((s) => (
            <div key={s.title} className="grid gap-3 py-10 md:grid-cols-[220px_1fr] md:gap-12">
              <dt className="font-display text-xl font-semibold">{s.title}</dt>
              <dd className="max-w-[65ch] text-lg leading-relaxed text-ink-soft">{s.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="objectives-title" className="border-t border-line bg-surface">
        <div className={`${container} grid gap-10 py-16 sm:py-20 md:grid-cols-[220px_1fr] md:gap-12`}>
          <h2 id="objectives-title" className="text-xl font-semibold">
            Objectives
          </h2>
          <ul className="grid max-w-3xl gap-x-10 gap-y-6 sm:grid-cols-2">
            {objectives.map((o) => (
              <li key={o} className="flex gap-3 leading-relaxed text-ink-soft">
                <Check className="mt-1 size-5 shrink-0 text-sage" aria-hidden="true" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className={`${container} flex flex-col gap-6 py-16 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold">About this prototype</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">
              This site was built as a recruitment assessment. It is not affiliated with or endorsed by the Government
              of Kerala or the Chief Minister&apos;s Office, and every grievance, figure and name on it is fictional.
            </p>
          </div>
          <Link href={routes.submit} className={button("primary", "lg")}>
            Submit a grievance
          </Link>
        </div>
      </section>
    </>
  );
}

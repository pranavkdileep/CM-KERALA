import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { StatusChip, type GrievanceStatus } from "@/components/status-chip";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { button, container, textLink } from "@/lib/ui";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "Follow a grievance from submission through CMO review, department assignment and action to resolution, and learn what each status means.",
  path: "/how-it-works",
});

type Stage = {
  title: string;
  who: string;
  status: GrievanceStatus;
  body: string;
  points: string[];
};

const stages: Stage[] = [
  {
    title: "You submit your grievance",
    who: "Citizen",
    status: "Submitted",
    body: "Sign in, choose your district and a category, and describe the problem in your own words. Attach a photo or document if you have one.",
    points: [
      "The AI assistant suggests a department, category and priority as you type. You can accept or change each suggestion.",
      "A reference number such as CMK-2026-004817 is issued the moment you submit.",
    ],
  },
  {
    title: "The CMO reviews it",
    who: "CMO administrator",
    status: "Under Review",
    body: "Staff at the Chief Minister's Office read every grievance. They check the details, confirm or correct the suggested department and set the priority.",
    points: [
      "Possible duplicates are flagged for a person to check, never merged automatically.",
      "Review is completed within 3 working days.",
    ],
  },
  {
    title: "It is assigned to a department",
    who: "CMO administrator",
    status: "In Progress",
    body: "The CMO forwards the grievance to the department responsible and, where possible, to a named officer. The assignment is recorded on your grievance.",
    points: [
      "You can see which department holds your grievance at any time.",
      "Internal remarks between the CMO and the department stay internal.",
    ],
  },
  {
    title: "The department takes action",
    who: "Department officer",
    status: "In Progress",
    body: "The officer investigates, updates progress as work happens and files an action taken report describing what was done.",
    points: [
      "Progress remarks written for the citizen appear on your tracking page.",
      "Grievances still open after 30 days are flagged as overdue and escalated by the CMO.",
    ],
  },
  {
    title: "The CMO confirms the resolution",
    who: "CMO administrator",
    status: "Resolved",
    body: "The CMO reviews the action taken report. If it answers the grievance, the case is marked resolved and you are told the outcome.",
    points: [
      "You can leave feedback on how your grievance was handled.",
      "If the problem is not fixed, the CMO can reopen it and send it back to the department.",
    ],
  },
];

const statusGuide: { status: GrievanceStatus; meaning: string }[] = [
  { status: "Submitted", meaning: "Received and waiting for CMO review." },
  { status: "Under Review", meaning: "CMO staff are checking the details and deciding where it goes." },
  { status: "In Progress", meaning: "A department is responsible and acting on it." },
  { status: "Resolved", meaning: "The CMO has accepted the department's action report." },
  { status: "Reopened", meaning: "Sent back for further action after review or citizen feedback." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro title="How a grievance moves from you to the people who can fix it">
        <p>
          Every grievance follows the same five stages. Each change of status is recorded with the date and the person
          responsible, so you can always see where your grievance is.
        </p>
      </PageIntro>

      <section aria-label="Stages" className={`${container} py-16 sm:py-20`}>
        <ol className="max-w-4xl">
          {stages.map((stage, i) => {
            const last = i === stages.length - 1;
            return (
              <li key={stage.title} className="grid grid-cols-[40px_1fr] gap-x-5 sm:grid-cols-[48px_1fr] sm:gap-x-8">
                <div className="relative flex justify-center" aria-hidden="true">
                  <span className="relative z-10 flex size-10 items-center justify-center rounded-full bg-navy font-display font-semibold text-white sm:size-12 sm:text-lg">
                    {i + 1}
                  </span>
                  {!last && <span className="absolute top-10 bottom-0 w-px bg-line sm:top-12" />}
                </div>
                <div className={last ? "pt-1.5" : "pt-1.5 pb-14"}>
                  <h2 className="text-[1.375rem] leading-snug font-semibold">
                    <span className="sr-only">Stage {i + 1}: </span>
                    {stage.title}
                  </h2>
                  <dl className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <dt className="text-slate">Who acts</dt>
                      <dd className="font-medium">{stage.who}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="text-slate">Status</dt>
                      <dd>
                        <StatusChip status={stage.status} />
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 max-w-[62ch] leading-relaxed text-ink-soft">{stage.body}</p>
                  <ul className="mt-4 max-w-[62ch] list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-soft marker:text-mist">
                    {stage.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="status-title" className="border-t border-line bg-surface">
        <div className={`${container} grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_2fr] lg:gap-16`}>
          <div>
            <h2 id="status-title" className="text-2xl font-semibold">
              What each status means
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              These are the only statuses a grievance can have. You will see them on your dashboard and on the
              tracking page.
            </p>
          </div>
          <table className="w-full text-left">
            <caption className="sr-only">Grievance statuses and their meaning</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Status</th>
                <th scope="col">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft border-y border-line">
              {statusGuide.map((s) => (
                <tr key={s.status}>
                  <th scope="row" className="w-40 py-4 pr-4 align-top font-normal sm:w-48">
                    <StatusChip status={s.status} />
                  </th>
                  <td className="py-4 leading-relaxed text-ink-soft">{s.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-line">
        <div className={`${container} flex flex-col gap-6 py-16 sm:flex-row sm:items-center sm:justify-between`}>
          <p className="max-w-xl leading-relaxed text-ink-soft">
            Still unsure whether your problem belongs here? Read the{" "}
            <Link href="/faq" className={textLink}>
              questions and answers
            </Link>{" "}
            or{" "}
            <Link href="/contact" className={textLink}>
              contact the grievance cell
            </Link>
            .
          </p>
          <Link href={routes.submit} className={button("primary", "lg")}>
            Submit a grievance
          </Link>
        </div>
      </section>
    </>
  );
}

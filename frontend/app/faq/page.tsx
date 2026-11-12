import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { PageIntro } from "@/components/page-intro";
import { allFaqs, faqGroups } from "@/lib/faqs";
import { pageMetadata } from "@/lib/seo";
import { container, textLink } from "@/lib/ui";

export const metadata = pageMetadata({
  title: "Questions and answers",
  description:
    "Answers to common questions about submitting a grievance, tracking it with a reference number, statuses, timelines and privacy.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: allFaqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <PageIntro title="Questions and answers">
        <p>What to expect when you submit a grievance, how to follow it and what to do if you are not satisfied.</p>
      </PageIntro>

      <div className={`${container} grid gap-12 py-14 sm:py-20 lg:grid-cols-[220px_1fr] lg:gap-16`}>
        <nav aria-label="Topics" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {faqGroups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="block rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-soft hover:text-navy lg:border-0 lg:bg-transparent lg:px-0 lg:py-1.5"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-14">
          {faqGroups.map((group) => (
            <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`}>
              <h2 id={`${group.id}-title`} className="text-xl font-semibold">
                {group.title}
              </h2>
              <div className="mt-4 border-t border-line">
                {group.items.map((item) => (
                  <details key={item.q} className="group border-b border-line">
                    <summary className="flex items-start justify-between gap-6 py-5 text-left font-medium text-navy hover:text-sage-deep">
                      <span className="text-[17px] leading-snug">{item.q}</span>
                      <ChevronDown
                        className="mt-0.5 size-5 shrink-0 text-slate transition-transform duration-200 group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="max-w-[65ch] pb-6 leading-relaxed text-ink-soft">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <p className="leading-relaxed text-ink-soft">
            Your question is not here?{" "}
            <Link href="/contact" className={textLink}>
              Send it to the grievance cell
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}

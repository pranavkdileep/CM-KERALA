import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageIntro } from "@/components/page-intro";
import { departments } from "@/lib/departments";
import { pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";
import { container, textLink } from "@/lib/ui";

export const metadata = pageMetadata({
  title: "Departments",
  description:
    "The government departments that receive and act on grievances forwarded by the Chief Minister's Office, and the problems each one handles.",
  path: "/departments",
});

export default function DepartmentsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Departments",
          itemListElement: departments.map((d, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: d.name,
            url: `${site.url}/departments#${d.slug}`,
          })),
        }}
      />

      <PageIntro title="Departments">
        <p>
          The Chief Minister&apos;s Office forwards each grievance to one of these departments. You do not need to pick
          the right one yourself: describe the problem and the CMO confirms where it goes.
        </p>
        <p className="mt-3 text-base text-slate">Sample departments for this prototype.</p>
      </PageIntro>

      <section aria-label="Department list" className={`${container} py-14 sm:py-20`}>
        <ul className="grid gap-x-12 md:grid-cols-2">
          {departments.map((d) => (
            <li
              key={d.slug}
              id={d.slug}
              className="grid scroll-mt-28 grid-cols-[44px_1fr] gap-x-5 border-t border-line py-8"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-sage-tint text-sage-deep">
                <d.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg leading-snug font-semibold">{d.name}</h2>
                <p className="mt-2 leading-relaxed text-ink-soft">{d.summary}</p>
                <h3 className="sr-only">Common grievances</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {d.handles.map((h) => (
                    <li key={h} className="rounded border border-line bg-page px-2.5 py-1 text-[13px] text-ink-soft">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line bg-surface">
        <p className={`${container} py-12 leading-relaxed text-ink-soft`}>
          Not sure your problem fits any of these?{" "}
          <Link href={routes.submit} className={textLink}>
            Submit it anyway
          </Link>{" "}
          and the CMO will route it, or{" "}
          <Link href="/contact" className={textLink}>
            ask the grievance cell
          </Link>
          .
        </p>
      </section>
    </>
  );
}

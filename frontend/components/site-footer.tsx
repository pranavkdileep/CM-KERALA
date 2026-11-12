import Link from "next/link";
import { Logo } from "@/components/logo";
import { routes, site } from "@/lib/site";
import { container } from "@/lib/ui";

const columns = [
  {
    title: "Grievances",
    links: [
      { href: routes.submit, label: "Submit a grievance" },
      { href: routes.track, label: "Track a grievance" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Portal",
    links: [
      { href: "/about", label: "About the initiative" },
      { href: "/departments", label: "Departments" },
      { href: "/faq", label: "Questions and answers" },
      { href: "/contact", label: "Contact us" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy text-mist">
      <div className={`${container} grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]`}>
        <div className="max-w-sm">
          <Logo inverse />
          <p className="mt-5 text-sm leading-relaxed">
            A single place for the people of Kerala to raise a grievance with the Chief Minister&apos;s Office and see
            it through to resolution.
          </p>
          <address className="mt-6 text-sm not-italic leading-relaxed">
            {site.contact.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <a href={`mailto:${site.contact.email}`} className="mt-2 block text-white hover:underline">
              {site.contact.email}
            </a>
          </address>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-display text-sm font-semibold text-white">{col.title}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className={`${container} flex flex-col gap-2 py-6 text-[13px] md:flex-row md:justify-between`}>
          <p>© 2026 {site.name}. Built as a recruitment prototype for WhiteMatrix Software Solutions.</p>
          <p>Not affiliated with or endorsed by the Government of Kerala or the Chief Minister&apos;s Office.</p>
        </div>
      </div>
    </footer>
  );
}

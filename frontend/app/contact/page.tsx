import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";
import { container, textLink } from "@/lib/ui";
import { ContactForm } from "./contact-form";

export const metadata = pageMetadata({
  title: "Contact us",
  description:
    "Questions about using the grievance portal, your account or a reference number? Send a message to the public grievance cell.",
  path: "/contact",
});

const details = [
  { icon: Mail, label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
  { icon: Phone, label: "Helpline (sample)", value: site.contact.phone },
  { icon: Clock, label: "Hours", value: site.contact.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageIntro title="Contact the grievance cell">
        <p>
          Ask about using the portal, your account or a grievance you have already submitted. To raise a new problem,{" "}
          <Link href={routes.submit} className={textLink}>
            submit a grievance
          </Link>{" "}
          so it gets a reference number.
        </p>
      </PageIntro>

      <div className={`${container} grid gap-14 py-14 sm:py-20 lg:grid-cols-[1fr_1.5fr] lg:gap-20`}>
        <section aria-labelledby="reach-title">
          <h2 id="reach-title" className="text-xl font-semibold">
            Other ways to reach us
          </h2>
          <ul className="mt-6 space-y-6">
            {details.map((d) => (
              <li key={d.label} className="flex gap-4">
                <d.icon className="mt-0.5 size-5 shrink-0 text-sage" aria-hidden="true" />
                <div>
                  <p className="text-sm text-slate">{d.label}</p>
                  {d.href ? (
                    <a href={d.href} className="font-medium text-navy hover:text-sage-deep">
                      {d.value}
                    </a>
                  ) : (
                    <p className="font-medium text-navy">{d.value}</p>
                  )}
                </div>
              </li>
            ))}
            <li className="flex gap-4">
              <MapPin className="mt-0.5 size-5 shrink-0 text-sage" aria-hidden="true" />
              <div>
                <p className="text-sm text-slate">Address</p>
                <address className="font-medium text-navy not-italic">
                  {site.contact.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </div>
            </li>
          </ul>
          <p className="mt-10 border-t border-line pt-6 text-sm leading-relaxed text-slate">
            Contact details on this prototype are fictional. Messages sent through the form are stored for
            demonstration only.
          </p>
        </section>

        <section aria-labelledby="form-title" className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h2 id="form-title" className="text-xl font-semibold">
            Send a message
          </h2>
          <p className="mt-1.5 mb-7 text-sm text-ink-soft">All fields are required. We reply within 3 working days.</p>
          <ContactForm />
        </section>
      </div>
    </>
  );
}

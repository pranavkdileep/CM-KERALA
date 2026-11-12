import type { Metadata } from "next";
import Link from "next/link";
import { TrackForm } from "@/components/track-form";
import { button, container } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className={`${container} py-20 sm:py-28`}>
      <h1 className="text-[2.25rem] leading-tight font-bold tracking-[-0.02em]">This page does not exist</h1>
      <p className="mt-4 max-w-[56ch] text-lg leading-relaxed text-ink-soft">
        The link may be out of date, or this part of the portal is not available yet. If you were looking for a
        grievance, track it with its reference number.
      </p>
      <div className="mt-10">
        <TrackForm id="notfound-track" />
      </div>
      <Link href="/" className={`${button("secondary", "md")} mt-10`}>
        Go to the home page
      </Link>
    </section>
  );
}

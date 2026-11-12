import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { textLink } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to submit and track grievances, or to work on grievances as the CMO or a department officer.",
  robots: { index: false },
};

const demo = [
  { role: "Citizen", email: "citizen1@cmkerala-demo.example" },
  { role: "CMO administrator", email: "cmo@cmkerala-demo.example" },
  { role: "Department officer", email: "officer.local-self-government@cmkerala-demo.example" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  const expired = params.expired === "1";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14 sm:py-20">
      <h1 className="text-[1.75rem] font-bold tracking-[-0.015em]">Sign in</h1>
      <p className="mt-2 text-ink-soft">
        New here?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className={textLink}>
          Create a citizen account
        </Link>
        .
      </p>
      {expired ? <p className="mt-5 rounded-lg bg-warning/[0.1] px-4 py-3 text-sm text-warning-ink">Your session has ended. Sign in again to continue.</p> : null}

      <div className="mt-8 rounded-lg border border-line bg-surface p-6 sm:p-7">
        <LoginForm next={next} />
      </div>

      <details className="group mt-6 rounded-lg border border-line bg-surface text-sm">
        <summary className="px-5 py-3.5 font-medium text-navy">Demo accounts for evaluators</summary>
        <div className="border-t border-line-soft px-5 py-4 text-ink-soft">
          <p>All demo accounts use the password Demo@12345. The data is fictional.</p>
          <ul className="mt-3 space-y-2">
            {demo.map((d) => (
              <li key={d.email}>
                <span className="block text-xs text-slate">{d.role}</span>
                <span className="font-mono text-[13px] text-navy">{d.email}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}

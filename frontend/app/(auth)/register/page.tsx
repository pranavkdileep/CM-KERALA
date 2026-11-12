import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";
import { textLink } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Register as a citizen to submit a grievance and follow it through to resolution.",
  robots: { index: false },
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14 sm:py-20">
      <h1 className="text-[1.75rem] font-bold tracking-[-0.015em]">Create a citizen account</h1>
      <p className="mt-2 text-ink-soft">
        You need an account to submit a grievance and follow its progress. Already registered?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className={textLink}>
          Sign in
        </Link>
        .
      </p>
      <p className="mt-4 rounded-lg bg-warning/[0.1] px-4 py-3 text-sm text-warning-ink">
        This is a recruitment prototype. Use fictional details only, not your real name or mobile number.
      </p>
      <div className="mt-6 rounded-lg border border-line bg-surface p-6 sm:p-7">
        <RegisterForm next={next} />
      </div>
    </div>
  );
}

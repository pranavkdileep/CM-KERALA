import type { ReactNode } from "react";
import { container } from "@/lib/ui";

export function PageIntro({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-surface">
      <div className={`${container} py-14 sm:py-20`}>
        <h1 className="max-w-3xl text-[2.25rem] leading-[1.15] font-bold tracking-[-0.02em] sm:text-[2.75rem]">
          {title}
        </h1>
        {children ? <div className="mt-5 max-w-[62ch] text-lg leading-relaxed text-ink-soft">{children}</div> : null}
      </div>
    </section>
  );
}

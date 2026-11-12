import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect width="36" height="36" rx="9" fill="#0F172A" />
      <path
        d="M10 11.5h16a2 2 0 0 1 2 2V22a2 2 0 0 1-2 2h-8.5L12 28v-4h-2a2 2 0 0 1-2-2v-8.5a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m13.5 17.8 3 3 6-6"
        fill="none"
        stroke="#34D399"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="CM Kerala Grievance Portal, home">
      <LogoMark className={inverse ? "size-9 rounded-[9px] ring-1 ring-white/25" : "size-9"} />
      <span className="flex flex-col leading-tight whitespace-nowrap">
        <span className={`font-display text-[15px] font-bold ${inverse ? "text-white" : "text-navy"}`}>
          CM Kerala
        </span>
        <span className={`text-[13px] ${inverse ? "text-mist" : "text-slate"}`}>Grievance Portal</span>
      </span>
    </Link>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white shadow-soft hover:bg-navy-deep",
  secondary: "border border-navy text-navy hover:bg-navy/[0.04]",
  ghost: "text-ink-soft hover:bg-line-soft hover:text-navy",
  inverse: "bg-white text-navy hover:bg-sage-tint",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-sm",
  md: "h-[42px] px-[22px] text-sm",
  lg: "h-12 px-7 text-base",
};

export function button(variant: Variant = "primary", size: Size = "md") {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

export const container = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

export const textLink =
  "font-medium text-sage-deep underline decoration-sage/40 underline-offset-4 hover:decoration-sage";

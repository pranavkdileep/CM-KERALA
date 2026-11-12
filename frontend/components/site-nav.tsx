"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { mainNav, routes } from "@/lib/site";
import { button } from "@/lib/ui";

// The logo already links home, so the desktop bar leaves "Home" out.
const desktopNav = mainNav.filter((item) => item.href !== "/");

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// Shown while the current path is resolving on routes with dynamic segments.
export function DesktopNavFallback() {
  return (
    <nav aria-label="Main" className="hidden xl:block">
      <ul className="flex items-center gap-1">
        {desktopNav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap text-ink-soft hover:bg-line-soft hover:text-navy">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MobileNavFallback() {
  return (
    <span className="flex size-10 items-center justify-center text-navy xl:hidden" aria-hidden="true">
      <Menu className="size-5" />
    </span>
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden xl:block">
      <ul className="flex items-center gap-1">
        {desktopNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-line-soft text-navy" : "text-ink-soft hover:bg-line-soft hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Native <details> keeps the menu usable without JavaScript.
// Keying it on the pathname closes it after every navigation.
export function MobileNav() {
  const pathname = usePathname();
  return (
    <details key={pathname} className="group xl:hidden">
      <summary
        className="flex size-10 items-center justify-center rounded-lg text-navy hover:bg-line-soft"
        aria-label="Open menu"
      >
        <Menu className="size-5 group-open:hidden" aria-hidden="true" />
        <X className="hidden size-5 group-open:block" aria-hidden="true" />
      </summary>
      <div className="absolute inset-x-0 top-full border-b border-line bg-surface shadow-raised">
        <nav aria-label="Main" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <ul className="flex flex-col">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-12 items-center rounded-lg px-3 text-base ${
                      active ? "bg-line-soft font-medium text-navy" : "text-ink-soft"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 border-t border-line-soft pt-2 xl:hidden">
            <Link href="/dashboard" className="flex h-12 items-center rounded-lg px-3 text-base font-medium text-navy">
              My account
            </Link>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-3 border-t border-line-soft pt-4 pb-2 sm:hidden">
            <Link href={routes.track} className={button("secondary", "md")}>
              Track grievance
            </Link>
            <Link href={routes.submit} className={button("primary", "md")}>
              Submit grievance
            </Link>
          </div>
        </nav>
      </div>
    </details>
  );
}

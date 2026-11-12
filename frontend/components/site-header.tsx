import { Suspense } from "react";
import Link from "next/link";
import { AccountArea, AccountFallback } from "@/components/account-area";
import { Logo } from "@/components/logo";
import { DesktopNav, DesktopNavFallback, MobileNav, MobileNavFallback } from "@/components/site-nav";
import { routes } from "@/lib/site";
import { button, container } from "@/lib/ui";

export function SiteHeader() {
  return (
    <>
      <div className="bg-navy text-[13px] text-mist">
        <p className={`${container} py-2`}>
          Recruitment prototype. Not an official service of the Government of Kerala. All data shown is fictional.
        </p>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
        <div className={`${container} relative flex h-[72px] items-center justify-between gap-4`}>
          <Logo />
          <Suspense fallback={<DesktopNavFallback />}>
            <DesktopNav />
          </Suspense>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="hidden xl:block">
                <Suspense fallback={<AccountFallback />}>
                  <AccountArea />
                </Suspense>
              </div>
              <Link href={routes.submit} className={button("primary", "md")}>
                Submit grievance
              </Link>
            </div>
            <Suspense fallback={<MobileNavFallback />}>
              <MobileNav />
            </Suspense>
          </div>
        </div>
      </header>
    </>
  );
}

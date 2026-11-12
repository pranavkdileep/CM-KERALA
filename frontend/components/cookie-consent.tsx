"use client";

import { useState, useSyncExternalStore } from "react";
import { button, container } from "@/lib/ui";

const CONSENT_COOKIE = "cmk_consent";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function hasAccepted() {
  return document.cookie.split("; ").some((c) => c === `${CONSENT_COOKIE}=accepted`);
}

// The cookie does not change while the page is open, so there is nothing to subscribe to.
const subscribe = () => () => {};

// Shown until the visitor accepts. The server render counts the notice as accepted, so the
// banner never flashes for visitors who already accepted, and it appears only after the browser checks.
export function CookieConsent() {
  const accepted = useSyncExternalStore(subscribe, hasAccepted, () => true);
  const [dismissed, setDismissed] = useState(false);

  if (accepted || dismissed) return null;

  function accept() {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_COOKIE}=accepted; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
    setDismissed(true);
  }

  return (
    <section
      aria-labelledby="cookie-notice-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface shadow-panel"
    >
      <div className={`${container} flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="max-w-3xl">
          <h2 id="cookie-notice-title" className="text-base font-semibold">
            Cookies on this site
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            We use one essential cookie to keep you signed in when you use the grievance portal. We do not use
            advertising or tracking cookies. This is a recruitment prototype, and all data on it is fictional.
          </p>
        </div>
        <button type="button" onClick={accept} className={`${button("primary", "md")} shrink-0`}>
          Accept cookies
        </button>
      </div>
    </section>
  );
}

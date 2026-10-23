"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const MEASUREMENT_ID = "G-2DMZPDM1TV";
const CONSENT_KEY = "clearflow-analytics-consent";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  clearflowAnalyticsInitialized?: boolean;
  [key: `ga-disable-${string}`]: unknown;
};

function initializeAnalytics() {
  const win = window as unknown as AnalyticsWindow;
  win[`ga-disable-${MEASUREMENT_ID}`] = false;

  if (win.clearflowAnalyticsInitialized) return;
  win.clearflowAnalyticsInitialized = true;
  win.dataLayer = win.dataLayer || [];
  win.gtag = function (..._args: unknown[]) { win.dataLayer?.push(arguments); };
  win.gtag("js", new Date());
  win.gtag("config", MEASUREMENT_ID, { send_page_view: false, anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

function trackPageView() {
  const win = window as unknown as AnalyticsWindow;
  win.gtag?.("event", "page_view", {
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function AnalyticsConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"loading" | "unknown" | "accepted" | "declined">("loading");
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    setConsent(saved === "accepted" || saved === "declined" ? saved : "unknown");
  }, []);

  useEffect(() => {
    if (consent !== "accepted") return;
    initializeAnalytics();
    trackPageView();
  }, [pathname, consent]);

  useEffect(() => {
    if (consent !== "accepted") return;
    const handleContactClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href^="mailto:"]');
      if (!link) return;
      (window as unknown as AnalyticsWindow).gtag?.("event", "contact_click", {
        contact_method: "email",
      });
    };
    document.addEventListener("click", handleContactClick);
    return () => document.removeEventListener("click", handleContactClick);
  }, [consent]);

  const choose = (next: "accepted" | "declined") => {
    window.localStorage.setItem(CONSENT_KEY, next);
    if (next === "declined") {
      (window as unknown as AnalyticsWindow)[`ga-disable-${MEASUREMENT_ID}`] = true;
    }
    setConsent(next);
    setShowPreferences(false);
  };

  if (consent === "loading") return null;

  return (
    <>
      {(consent === "unknown" || showPreferences) && (
        <section aria-label="Analytics preferences" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-xl border border-[#b8c9bd] bg-white p-5 text-[#173e32] shadow-xl sm:inset-x-6">
          <p className="text-sm font-semibold">Optional website analytics</p>
          <p className="mt-2 text-sm leading-6">
            We use optional Google Analytics cookies to understand how visitors use our website. You can accept or decline, and change your choice any time.{" "}<Link href="/privacy" className="underline underline-offset-2 hover:text-[#367b5e]">Privacy policy</Link>.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="cursor-pointer rounded-lg bg-[#245c46] px-4 py-2 text-sm font-semibold text-white hover:bg-[#367b5e]" onClick={() => choose("accepted")}>Accept cookies</button>
            <button type="button" className="cursor-pointer rounded-lg border border-[#245c46] px-4 py-2 text-sm font-semibold hover:bg-[#edf4ee]" onClick={() => choose("declined")}>Decline cookies</button>
          </div>
        </section>
      )}
      {consent !== "unknown" && !showPreferences && (
        <button type="button" onClick={() => setShowPreferences(true)} className="fixed bottom-3 left-3 z-40 cursor-pointer rounded-lg border border-[#b8c9bd] bg-white/95 px-3 py-1.5 text-xs font-medium text-[#173e32] shadow-sm">
          Analytics settings
        </button>
      )}
    </>
  );
}

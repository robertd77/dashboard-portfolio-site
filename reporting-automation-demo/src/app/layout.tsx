import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsConsent } from "@/components/analytics-consent";

export const metadata: Metadata = {
  metadataBase: new URL("https://clearflowreporting.ca"),
  title: { default: "Reporting Automation for Small Businesses | Clearflow Reporting", template: "%s | Clearflow Reporting" },
  description: "Simplify spreadsheet workflows, automate recurring reports, and turn disconnected business data into clear dashboards. Explore Clearflow Reporting.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "Clearflow Reporting",
    title: "Reporting Automation for Small Businesses | Clearflow Reporting",
    description: "Simplify spreadsheet workflows, automate recurring reports, and turn disconnected business data into clear dashboards. Explore Clearflow Reporting.",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Clearflow Reporting — Less manual work. Clearer reporting." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reporting Automation for Small Businesses | Clearflow Reporting",
    description: "Simplify spreadsheet workflows, automate recurring reports, and turn disconnected business data into clear dashboards. Explore Clearflow Reporting.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a>{children}<AnalyticsConsent /></body></html>;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Clearflow Reporting | Less manual work. Clearer reporting.", template: "%s | Clearflow Reporting" },
  description: "Clearflow Reporting automates repetitive spreadsheet and reporting workflows for small businesses. Explore the Northwood demonstration and see the process in action.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a>{children}</body></html>;
}

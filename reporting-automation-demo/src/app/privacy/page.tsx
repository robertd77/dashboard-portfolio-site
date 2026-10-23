import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Clearflow Reporting uses optional analytics cookies and handles information submitted through our website.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-14 text-foreground">
      <Link href="/" className="text-sm font-semibold text-primary underline underline-offset-4">← Clearflow Reporting</Link>
      <h1 className="mt-9 text-4xl font-semibold">Privacy policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated: October 23, 2026</p>
      <p className="mt-7 leading-7">Clearflow Reporting operates this website to explain its reporting automation services and demonstrate sample workflows. This page explains our use of optional website analytics and contact information.</p>

      <h2 className="mt-10 text-2xl font-semibold">Optional analytics cookies</h2>
      <p className="mt-4 leading-7">With your permission, we use Google Analytics 4, provided by Google, to understand visits and how our website is used. It can collect information such as pages viewed, visit and referral information, approximate location, device and browser details, and identifiers stored in analytics cookies. We also record an event when a visitor clicks an email contact link, but that event does not confirm that an email was sent.</p>
      <p className="mt-4 leading-7">We do not load the Google Analytics tag unless you accept optional cookies. You can decline and still use the website. You can also change your choice using the <strong>Analytics settings</strong> control on the website. Declining or withdrawing consent stops future analytics tracking from our site; it does not erase data already collected by Google. You can clear existing analytics cookies using your browser settings.</p>
      <p className="mt-4 leading-7">Information collected through Google Analytics is processed by Google under its applicable terms and policies and may be processed outside Canada. Learn more from <a className="underline underline-offset-4" href="https://support.google.com/analytics/answer/6004245" target="_blank" rel="noopener noreferrer">Google's Analytics privacy information</a>.</p>

      <h2 className="mt-10 text-2xl font-semibold">Your preferences</h2>
      <p className="mt-4 leading-7">We store your choice to accept or decline analytics in your browser's local storage so you do not have to answer every time you visit. This preference is separate from Google Analytics cookies.</p>

      <h2 className="mt-10 text-2xl font-semibold">Contacting us</h2>
      <p className="mt-4 leading-7">If you email us, we use the information you provide to respond to your inquiry and communicate about services. Please avoid including sensitive personal information in an initial message. To ask about privacy or your information, email <a className="underline underline-offset-4" href="mailto:clearflowreporting@gmail.com">clearflowreporting@gmail.com</a>.</p>

      <h2 className="mt-10 text-2xl font-semibold">Updates</h2>
      <p className="mt-4 leading-7">We may update this policy if the website or our data practices change. We will update the date shown above when we do.</p>
      <Link href="/" className="mt-10 inline-block text-sm font-semibold text-primary underline underline-offset-4">Back to home</Link>
    </main>
  );
}

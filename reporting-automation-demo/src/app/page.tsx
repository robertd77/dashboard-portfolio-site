import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChartNoAxesCombined, Check, CircleCheck, FileSpreadsheet, Layers, Mail, ScanLine, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesPreview } from "@/components/landing/sales-preview";
import { SiteNavigation } from "@/components/site-navigation";
import { SectionReveals } from "@/components/landing/section-reveals";
import styles from "@/components/landing/landing.module.css";
import { selectCaseStudyInsights } from "@/lib/case-study/insights";
import { dashboardDataFromWorkflow } from "@/lib/dashboard/data";
import { formatCompactCurrency, formatNumber, formatPercentage } from "@/lib/dashboard/format";
import { selectMonthlySales } from "@/lib/dashboard/monthly-sales";
import { DEFAULT_DASHBOARD_FILTERS, filterDashboardData } from "@/lib/dashboard/selectors";
import { rawDatasets } from "@/lib/datasets";
import { runReportingWorkflow } from "@/lib/processing/workflow";

export const metadata: Metadata = {
  title: { absolute: "Reporting Automation for Small Businesses | Clearflow Reporting" },
  description: "Simplify spreadsheet workflows, automate recurring reports, and turn disconnected business data into clear dashboards. Explore Clearflow Reporting.",
  alternates: { canonical: "/" },
  openGraph: { title: "Reporting Automation for Small Businesses | Clearflow Reporting", description: "Simplify spreadsheet workflows, automate recurring reports, and turn disconnected business data into clear dashboards. Explore Clearflow Reporting.", url: "/" },
  twitter: { title: "Reporting Automation for Small Businesses | Clearflow Reporting", description: "Simplify spreadsheet workflows, automate recurring reports, and turn disconnected business data into clear dashboards. Explore Clearflow Reporting." },
};

export default async function HomePage() {
  const data = dashboardDataFromWorkflow(await runReportingWorkflow());
  const insights = selectCaseStudyInsights(data);
  const points = selectMonthlySales(filterDashboardData(data, DEFAULT_DASHBOARD_FILTERS), DEFAULT_DASHBOARD_FILTERS);
  const peak = Math.max(0, ...points.map((point) => point.netSales ?? 0));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Clearflow Reporting",
    url: "https://clearflowreporting.ca",
    description: "Simplify spreadsheet workflows, automate recurring reports, and turn disconnected business data into clear dashboards. Explore Clearflow Reporting.",
    email: "clearflowreporting@gmail.com",
    areaServed: { "@type": "Country", name: "Canada" },
    serviceType: ["Reporting automation", "Data cleanup and integration", "Dashboards and internal tools"],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <SectionReveals className={styles.landing}>
    <div className={styles.dark}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" className={styles.logo} aria-label="Clearflow Reporting home"><span className={styles.logoMark}><Workflow size={21} strokeWidth={1.6} aria-hidden="true" /></span><span>Clearflow<br />Reporting</span></Link>
          <SiteNavigation variant="home" />
        </div>
      </header>
    </div>
    <main id="main-content" tabIndex={-1} className="outline-none">
      <div className={styles.dark}>
        <section className={`${styles.container} ${styles.hero}`} aria-labelledby="hero-title">
          <div>
            <p className={`${styles.kicker} ${styles.heroEnter}`}>Independent consulting / Small business workflows</p>
            <h1 id="hero-title" className={`${styles.heroTitle} ${styles.heroEnter} ${styles.delay1}`}>Less manual work.<span>Clearer reporting.</span></h1>
            <p className={`${styles.heroCopy} ${styles.heroEnter} ${styles.delay2}`}>I automate repetitive spreadsheet and reporting workflows for small businesses. Turn exports, cleanup, and recurring calculations into a process your team can repeat.</p>
            <div className={`${styles.actions} ${styles.heroEnter} ${styles.delay3}`}><Button asChild className={styles.accentButton}><Link href="/raw-data">Explore the Demo<ArrowRight aria-hidden="true" /></Link></Button><Button asChild variant="outline" className={styles.outlineButton}><a href="#contact">Get in Touch<ArrowUpRight aria-hidden="true" /></a></Button></div>
            <p className={`${styles.heroNote} ${styles.heroEnter} ${styles.delay3}`}><CircleCheck size={14} aria-hidden="true" />Built around your workflow. Clear enough to hand over.</p>
          </div>
          <figure className={`${styles.visual} ${styles.heroEnter} ${styles.delay2}`} aria-label="Exports are checked and prepared for reporting. An illustration of the workflow.">
            <div className={styles.flowBoard} aria-hidden="true">
              <div className={styles.boardHeader}><p>Your reporting workflow</p><span><i /><i /><i /></span></div>
              <div className={styles.flowGrid}>
                <div className={styles.sources}>{rawDatasets.map((dataset) => <div className={styles.source} key={dataset.id}><FileSpreadsheet size={15} strokeWidth={1.5} /><p>{dataset.id === "products" ? "Products" : dataset.name}</p><span>CSV</span></div>)}</div>
                <div className={styles.processor}><span className={styles.packet} /><span className={`${styles.packet} ${styles.packet2}`} /><span className={styles.processorIcon}><ScanLine size={18} strokeWidth={1.5} /></span></div>
                <div className={styles.report}><p className={styles.reportTitle}>Useful reporting<CircleCheck size={12} /></p><div className={styles.miniBars}>{points.map((point) => <span key={point.month} style={{ height: `${peak > 0 ? Math.max(0, point.netSales ?? 0) / peak * 100 : 0}%`, backgroundColor: point.month >= "2025-10" ? "#bd741d" : undefined }} />)}</div><div className={styles.reportRows}><span>Consistent calculations<Check size={10} /></span><span>Exceptions visible<Check size={10} /></span><span>Ready for review<Check size={10} /></span></div></div>
              </div>
              <div className={styles.boardFooter}><span>01 / EXPORT</span><span>02 / PREPARE</span><span>03 / REPORT</span></div>
            </div>
            <figcaption className={styles.visualCaption}>Workflow illustration · Northwood sales pattern</figcaption>
          </figure>
        </section>
      </div>
      <div className={styles.container}>
        <section id="services" className={styles.section} data-reveal aria-labelledby="services-title">
          <p className="eyebrow">What I help with</p><h2 id="services-title" className={styles.sectionHeading}>Make the work behind the report <span className="heading-highlight">simpler.</span></h2>
          <div className={styles.services}>{[
            { icon: Workflow, title: "Reporting automation", text: "Replace recurring copy-and-paste routines with a repeatable path from source exports to reports." },
            { icon: Layers, title: "Data cleanup & integration", text: "Bring disconnected files together, standardize everyday inconsistencies, and make exceptions easy to review." },
            { icon: ChartNoAxesCombined, title: "Dashboards & internal tools", text: "Give your team a clear place to review results and manage the workflow, using tools that fit the business." },
          ].map((service) => <article key={service.title} className={styles.service}><span className="icon-tile"><service.icon size={22} strokeWidth={1.5} aria-hidden="true" /></span><h3>{service.title}</h3><p>{service.text}</p></article>)}</div>
        </section>
        <section id="work" className={`${styles.section} ${styles.feature}`} data-reveal aria-labelledby="work-title">
          <div><p className="eyebrow">Featured workflow</p><p className={styles.caseLabel}>Sample case study · Fictional business using simulated data</p><h2 id="work-title" className={styles.sectionHeading}>Northwood Supply Co.</h2><p className={styles.sectionIntro}>Four ordinary exports. One connected reporting workflow. Follow an Ontario apparel retailer’s data from Shopify-style and accounting files through validation to useful management reporting.</p>
            <dl className={styles.stats}><div><dt>2025 net sales · CAD</dt><dd data-testid="landing-annual-sales">{formatCompactCurrency(insights.kpis.netSales, 2)}</dd></div><div><dt>Distinct orders</dt><dd data-testid="landing-orders">{formatNumber(insights.kpis.orders)}</dd></div><div><dt>Source exports</dt><dd>{rawDatasets.length}</dd></div></dl>
            <p className="text-sm leading-6 text-muted-foreground">The reporting reveals {formatCompactCurrency(insights.q4Sales)} in Q4 sales ({formatPercentage(insights.q4Share)} of the year) while keeping data-quality exceptions visible.</p>
            <div className={styles.actions}><Button asChild><Link href="/case-study">Read the Case Study<ArrowUpRight aria-hidden="true" /></Link></Button><Link href="/raw-data" className={styles.inlineLink}>Explore the Demo<ArrowRight size={15} aria-hidden="true" /></Link></div>
            
          </div>
          <SalesPreview points={points} total={insights.kpis.netSales} />
        </section>
        <section id="approach" className={styles.section} data-reveal aria-labelledby="approach-title">
          <p className="eyebrow">How it works</p><h2 id="approach-title" className={styles.sectionHeading}>Start with the routine. Build a <span className="heading-highlight">better way</span> to run it.</h2>
          <ol className={styles.process}>{[
            { title: "Understand the Workflow", text: "Map the files, spreadsheet steps, recurring questions, and review points with the people doing the work." },
            { title: "Automate the Process", text: "Turn repeatable cleanup and calculations into a dependable flow, with clear checks and exception handling." },
            { title: "Deliver Useful Reporting", text: "Put the results in a format your team can use, with a straightforward handover and a process to repeat." },
          ].map((step, index) => <li key={step.title}><p className={styles.processNumber} aria-hidden="true">0{index + 1} /</p><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
        </section>
      </div>
      <section id="contact" className={`${styles.dark} ${styles.contact}`} data-reveal aria-labelledby="contact-title">
        <div className={`${styles.container} ${styles.contactInner}`}><div><p className={styles.kicker}>Let’s simplify the next reporting cycle</p><h2 id="contact-title" className={styles.sectionHeading}>Got a spreadsheet routine that <span className={styles.contactEmphasis}>keeps coming back?</span></h2><p>Tell me what you export, what you do with it, and which report you need at the end. Then we&apos;ll get started.</p></div><div><a href="mailto:clearflowreporting@gmail.com" className={styles.email}>clearflowreporting@gmail.com<Mail size={22} strokeWidth={1.5} aria-hidden="true" /></a><p className={styles.contactTagline}>Less manual work. Clearer reporting.</p></div></div>
      </section>
    </main>
    <footer className={`${styles.dark} ${styles.footer}`}><div className={`${styles.container} ${styles.footerInner}`}><p>Clearflow Reporting · Independent consulting</p><div className="flex flex-wrap gap-5"><Link href="/case-study">Northwood case study</Link><Link href="/raw-data">Interactive demo</Link><a href="#contact">Get in touch</a><Link href="/privacy">Privacy policy</Link></div></div></footer>
    </SectionReveals>
  </>;
}

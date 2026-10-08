import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Shared hierarchy and spacing for Northwood's reporting charts. */
export function ReportingChartCard({ id, title, subtitle, summary, children, footer, className }: {
  id: string;
  title: string;
  subtitle: string;
  summary?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0 overflow-hidden p-5 sm:p-6", className)}>
      <section aria-labelledby={`${id}-title`}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h3 id={`${id}-title`} className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
          </div>
          {summary}
        </div>
        {children}
        {footer && <div className="mt-5 border-t border-border/70 pt-5">{footer}</div>}
      </section>
    </Card>
  );
}

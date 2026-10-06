"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { workflowSteps } from "@/lib/workflow";
import { cn } from "@/lib/utils";

export function WorkflowNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Reporting workflow" className="workflow-nav">
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {workflowSteps.map((step, index) => {
          const active = pathname === step.href;
          return (
            <li key={step.href}>
              <Link
                href={step.href}
                aria-current={active ? "page" : undefined}
                className={cn("step-link", active && "step-link-active")}
              >
                <span className="step-number" aria-hidden="true">0{index + 1}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{step.label}</span>
                  <span className="step-description">{step.description}</span>
                </span>
                <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

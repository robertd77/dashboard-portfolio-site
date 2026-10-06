import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workflowSteps } from "@/lib/workflow";

export function StageNavigation({ index }: { index: number }) {
  const previous = workflowSteps[index - 1];
  const next = workflowSteps[index + 1];

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
      {previous ? (
        <Button asChild variant="outline">
          <Link href={previous.href}><ArrowLeft aria-hidden="true" />{previous.label}</Link>
        </Button>
      ) : <p className="text-sm text-muted-foreground">Four exports. One reporting workflow.</p>}
      {next && (
        <Button asChild>
          <Link href={next.href}>{next.label}<ArrowRight aria-hidden="true" /></Link>
        </Button>
      )}
    </div>
  );
}

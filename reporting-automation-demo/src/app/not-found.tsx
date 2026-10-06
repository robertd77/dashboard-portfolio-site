import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/page-heading";

export default function NotFound() {
  return (
    <>
      <PageHeading step="Page not found" title="Let’s get back to the workflow."
        description="This page is not part of the Northwood demo. Start with the source exports to explore the reporting stages." />
      <Button asChild><Link href="/raw-data">Back to Raw Data</Link></Button>
    </>
  );
}

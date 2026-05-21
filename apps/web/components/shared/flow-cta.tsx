import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, cn } from "@ai-coo/ui";

export function FlowCta({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Button variant="ghost" size="sm" className={cn("mt-3 gap-1 px-0 h-auto", className)} asChild>
      <Link href={href}>
        {label}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Button>
  );
}

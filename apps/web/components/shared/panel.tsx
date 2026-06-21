import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, SectionHeader, cn } from "@ai-coo/ui";

export function Panel({
  title,
  subtitle,
  children,
  className,
  contentClassName,
  action,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  action?: ReactNode;
}) {
  return (
    <Card className={cn(className)}>
      {title ? (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <SectionHeader title={title} description={subtitle} variant="panel" />
          {action}
        </CardHeader>
      ) : null}
      <CardContent className={cn(!title && "pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

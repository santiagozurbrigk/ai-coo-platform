import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, cn } from "@ai-coo/ui";

export function Panel({
  title,
  children,
  className,
  contentClassName,
  action,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  action?: ReactNode;
}) {
  return (
    <Card className={cn(className)}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(!title && "pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, cn } from "@ai-coo/ui";

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
      {title && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(!title && "pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

import * as React from "react";
import { cn } from "../lib/utils";

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  as?: keyof HTMLElementTagNameMap;
};

const headingStyles = {
  h1: "text-3xl font-semibold tracking-tight text-foreground",
  h2: "text-2xl font-semibold tracking-tight text-foreground",
  h3: "text-xl font-semibold tracking-tight text-foreground",
  h4: "text-lg font-medium tracking-tight text-foreground",
} as const;

export function Heading({
  as: Tag = "h2",
  className,
  ...props
}: TypographyProps & { level?: keyof typeof headingStyles }) {
  const level = (props as { level?: keyof typeof headingStyles }).level ?? "h2";
  const Component = Tag;
  return (
    <Component
      className={cn(headingStyles[level], className)}
      {...props}
    />
  );
}

export function Text({
  className,
  muted,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }) {
  return (
    <p
      className={cn(
        "text-sm leading-relaxed",
        muted ? "text-muted-foreground" : "text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function Caption({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-2xs text-muted-foreground uppercase tracking-wider", className)}
      {...props}
    />
  );
}

export function Mono({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("font-mono text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

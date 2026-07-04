"use client";

import { useState } from "react";
import { cn } from "@ai-coo/ui";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function LeadAvatar({
  name,
  attendeeId,
  accountId,
  className,
}: {
  name: string;
  attendeeId?: string;
  accountId?: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = initialsFromName(name);
  const showImage = Boolean(attendeeId?.trim()) && !imageFailed;

  const pictureUrl = attendeeId
    ? `/api/integrations/unipile/attendee-picture/${encodeURIComponent(attendeeId)}${
        accountId ? `?accountId=${encodeURIComponent(accountId)}` : ""
      }`
    : null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-micro font-semibold text-muted-foreground",
        className
      )}
      aria-hidden
    >
      {showImage && pictureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pictureUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

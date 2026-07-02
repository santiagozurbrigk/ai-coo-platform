import { looksLikePlaceholderLeadName } from "@/lib/sales/lead-name";
import {
  getUnipileAttendeeById,
  listUnipileChatAttendees,
  UnipileApiError,
  type UnipileChatAttendee,
} from "./client";

export {
  looksLikePlaceholderLeadName,
  looksLikePlaceholderLeadName as looksLikeUnipileIdLeadName,
} from "@/lib/sales/lead-name";

const ATTENDEE_NAME_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RESOLVED_ATTENDEE_NAME_CACHE = new Map<
  string,
  { name: string; expiresAt: number }
>();

function attendeeCacheKey(accountId: string, attendeeId: string): string {
  return `${accountId}:${attendeeId}`;
}

function getCachedAttendeeName(
  accountId: string,
  attendeeId: string
): string | null {
  const key = attendeeCacheKey(accountId, attendeeId);
  const entry = RESOLVED_ATTENDEE_NAME_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    RESOLVED_ATTENDEE_NAME_CACHE.delete(key);
    return null;
  }
  return entry.name;
}

export function rememberResolvedAttendeeName(
  accountId: string,
  attendeeId: string,
  name: string
): void {
  const trimmed = name.trim();
  if (!trimmed || looksLikePlaceholderLeadName(trimmed)) return;
  RESOLVED_ATTENDEE_NAME_CACHE.set(attendeeCacheKey(accountId, attendeeId), {
    name: trimmed,
    expiresAt: Date.now() + ATTENDEE_NAME_CACHE_TTL_MS,
  });
}

export function fallbackUnipileLeadNameFromId(senderId: string): string {
  const id = senderId.trim();
  if (id.length > 20) return `${id.slice(0, 8)}…`;
  return id;
}

function logUnipileApiFailure(context: string, err: unknown): void {
  if (err instanceof UnipileApiError) {
    console.warn(`[Unipile] ${context} — API error`, {
      status: err.status,
      body: err.body?.slice(0, 500),
    });
    return;
  }
  console.warn(`[Unipile] ${context} — error`, err);
}

function pickAttendeeDisplayName(attendee: UnipileChatAttendee): string | null {
  const name = attendee.name?.trim();
  if (!name || looksLikePlaceholderLeadName(name)) return null;
  return name;
}

function isSelfAttendee(attendee: UnipileChatAttendee): boolean {
  return attendee.is_self === 1 || attendee.is_self === true;
}

export async function resolveUnipileAttendeeDisplayName(options: {
  accountId: string;
  attendeeId?: string | null;
  chatId?: string | null;
  skipApi?: boolean;
}): Promise<string | null> {
  const { accountId, attendeeId, chatId, skipApi } = options;
  const attendeeIdTrimmed = attendeeId?.trim();

  if (attendeeIdTrimmed) {
    const cached = getCachedAttendeeName(accountId, attendeeIdTrimmed);
    if (cached) {
      console.log("[Unipile] attendee name desde cache en memoria:", {
        attendeeId: attendeeIdTrimmed,
        name: cached,
      });
      return cached;
    }
  }

  if (skipApi) return null;

  if (attendeeIdTrimmed) {
    try {
      const attendee = await getUnipileAttendeeById(attendeeIdTrimmed, accountId);
      const name = attendee && pickAttendeeDisplayName(attendee);
      if (name) {
        rememberResolvedAttendeeName(accountId, attendeeIdTrimmed, name);
        return name;
      }
      if (!attendee) {
        console.warn("[Unipile] chat_attendees sin resultado", {
          attendeeId: attendeeIdTrimmed,
          accountId,
        });
      }
    } catch (err) {
      logUnipileApiFailure(`GET chat_attendees/${attendeeIdTrimmed}`, err);
    }
  }

  if (chatId?.trim()) {
    try {
      const attendees = await listUnipileChatAttendees(chatId.trim());
      for (const attendee of attendees) {
        if (isSelfAttendee(attendee)) continue;
        if (attendeeIdTrimmed && attendee.id !== attendeeIdTrimmed) continue;
        const name = pickAttendeeDisplayName(attendee);
        if (name) {
          if (attendeeIdTrimmed) {
            rememberResolvedAttendeeName(accountId, attendeeIdTrimmed, name);
          }
          return name;
        }
      }

      for (const attendee of attendees) {
        if (isSelfAttendee(attendee)) continue;
        const name = pickAttendeeDisplayName(attendee);
        if (name) {
          if (attendeeIdTrimmed) {
            rememberResolvedAttendeeName(accountId, attendeeIdTrimmed, name);
          }
          return name;
        }
      }

      console.warn("[Unipile] chats/attendees sin nombre usable", {
        chatId: chatId.trim(),
        attendeeCount: attendees.length,
      });
    } catch (err) {
      logUnipileApiFailure(`GET chats/${chatId.trim()}/attendees`, err);
    }
  }

  return null;
}

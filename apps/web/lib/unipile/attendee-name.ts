import {
  getUnipileAttendeeById,
  listUnipileChatAttendees,
  type UnipileChatAttendee,
} from "./client";

/** Nombre que parece ID interno de Unipile (sin espacios, hash, truncado con …). */
export function looksLikeUnipileIdLeadName(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "Contacto") return true;
  if (trimmed.includes(" ")) return false;
  if (/…$|\.\.\.$/.test(trimmed)) return true;
  return /^[A-Za-z0-9_-]{6,}$/.test(trimmed);
}

export function fallbackUnipileLeadNameFromId(senderId: string): string {
  const id = senderId.trim();
  if (id.length > 20) return `${id.slice(0, 8)}…`;
  return id;
}

function pickAttendeeDisplayName(attendee: UnipileChatAttendee): string | null {
  const name = attendee.name?.trim();
  if (!name || looksLikeUnipileIdLeadName(name)) return null;
  return name;
}

function isSelfAttendee(attendee: UnipileChatAttendee): boolean {
  return attendee.is_self === 1 || attendee.is_self === true;
}

export async function resolveUnipileAttendeeDisplayName(options: {
  accountId: string;
  attendeeId?: string | null;
  chatId?: string | null;
}): Promise<string | null> {
  const { accountId, attendeeId, chatId } = options;
  const attendeeIdTrimmed = attendeeId?.trim();

  if (attendeeIdTrimmed) {
    const attendee = await getUnipileAttendeeById(attendeeIdTrimmed, accountId);
    const name = attendee && pickAttendeeDisplayName(attendee);
    if (name) return name;
  }

  if (chatId?.trim()) {
    const attendees = await listUnipileChatAttendees(chatId.trim());
    for (const attendee of attendees) {
      if (isSelfAttendee(attendee)) continue;
      if (attendeeIdTrimmed && attendee.id !== attendeeIdTrimmed) continue;
      const name = pickAttendeeDisplayName(attendee);
      if (name) return name;
    }

    for (const attendee of attendees) {
      if (isSelfAttendee(attendee)) continue;
      const name = pickAttendeeDisplayName(attendee);
      if (name) return name;
    }
  }

  return null;
}

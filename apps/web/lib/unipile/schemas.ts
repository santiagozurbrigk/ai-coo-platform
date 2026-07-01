import { z } from "zod";

export const unipileProviderSchema = z.enum(["instagram", "whatsapp"]);

export const unipileConnectQuerySchema = z.object({
  provider: unipileProviderSchema,
});

export const unipileDisconnectBodySchema = z.object({
  provider: unipileProviderSchema,
});

export const unipileHostedCallbackSchema = z.object({
  status: z.string(),
  account_id: z.string().min(1),
  name: z.string().min(1),
});

const unipileAttendeeSchema = z
  .object({
    attendee_id: z.string().optional(),
    attendee_name: z.string().optional().nullable(),
    attendee_specifics: z
      .object({
        phone_number: z.string().optional(),
      })
      .passthrough()
      .optional(),
    display_name: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
  })
  .passthrough();

const unipileBooleanishSchema = z.union([z.boolean(), z.number()]).optional();

/** Payload plano de messaging webhooks (WhatsApp / Instagram vía Unipile). */
export const unipileMessagingWebhookSchema = z
  .object({
    event: z.string().optional(),
    account_id: z.string().min(1),
    account_type: z.string().optional(),
    chat_id: z.string().min(1),
    message: z.union([z.string(), z.record(z.string(), z.unknown())]).optional().nullable(),
    message_id: z.string().optional(),
    id: z.string().optional(),
    timestamp: z.string().optional(),
    is_sender: z.boolean().optional(),
    is_group: z.boolean().optional(),
    provider_chat_id: z.string().optional(),
    sender: unipileAttendeeSchema.optional(),
    deleted: z.boolean().optional(),
    hidden: z.boolean().optional(),
    is_event: unipileBooleanishSchema,
  })
  .passthrough();

export const unipileMessagePayloadSchema = z
  .object({
    id: z.string().min(1),
    chat_id: z.string().min(1),
    account_id: z.string().min(1),
    sender_id: z.string().optional(),
    text: z.string().optional().nullable(),
    timestamp: z.string().optional(),
    is_sender: z.boolean().optional(),
    deleted: z.boolean().optional(),
    hidden: z.boolean().optional(),
    is_event: unipileBooleanishSchema,
    sender: unipileAttendeeSchema.optional(),
  })
  .passthrough();

export const unipileEventWebhookSchema = z.object({
  type: z.string().optional(),
  account_id: z.string().optional(),
  payload: unipileMessagePayloadSchema.optional(),
});

export const unipileLegacyMessageWebhookSchema = z
  .object({
    account_id: z.string().optional(),
    message: z
      .union([z.string(), unipileMessagePayloadSchema, z.record(z.string(), z.unknown())])
      .optional(),
  })
  .passthrough();

export type UnipileMessagingWebhook = z.infer<typeof unipileMessagingWebhookSchema>;
export type UnipileMessagePayload = z.infer<typeof unipileMessagePayloadSchema>;

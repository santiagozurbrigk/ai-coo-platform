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
    is_event: z.boolean().optional(),
    sender: z
      .object({
        attendee_name: z.string().optional().nullable(),
        display_name: z.string().optional().nullable(),
        name: z.string().optional().nullable(),
      })
      .passthrough()
      .optional(),
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
    message: unipileMessagePayloadSchema.optional(),
  })
  .passthrough();

export type UnipileMessagePayload = z.infer<typeof unipileMessagePayloadSchema>;

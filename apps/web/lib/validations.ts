import { z } from "zod";
import { AI_BRAIN_MAX_FILE_BYTES } from "@/lib/ai-brain/file-types";
import { PERMISSION_MODULES } from "@/constants/permission-modules";
import type { PermissionModuleId } from "@/constants/permission-modules";

const noScriptPattern = /<script|javascript:|on\w+=/i;

export const textSchema = z
  .string()
  .min(1, "Campo requerido")
  .max(500, "Máximo 500 caracteres")
  .refine((val) => !noScriptPattern.test(val), "Contenido no permitido");

export const longTextSchema = z
  .string()
  .min(1, "Campo requerido")
  .max(50_000, "Máximo 50.000 caracteres")
  .refine((val) => !/<script|javascript:/i.test(val), "Contenido no permitido");

export const emailSchema = z
  .string()
  .email("Email inválido")
  .max(254, "Email demasiado largo")
  .transform((v) => v.toLowerCase());

export const apiKeySchema = z
  .string()
  .min(10, "API key demasiado corta")
  .max(256, "API key demasiado larga")
  .regex(/^[a-zA-Z0-9_\-\.]+$/, "La API key contiene caracteres no válidos");

export const moneySchema = z
  .number()
  .min(0, "No puede ser negativo")
  .max(10_000_000, "Valor demasiado alto")
  .finite();

export const uuidSchema = z.string().uuid("ID inválido");

export const aiPromptSchema = z
  .string()
  .min(1, "Escribí algo antes de enviar")
  .max(4000, "El mensaje no puede superar los 4.000 caracteres")
  .refine((val) => val.trim().length > 0, "El mensaje no puede estar vacío")
  .refine((val) => !noScriptPattern.test(val), "Contenido no permitido");

export const orgNameSchema = z
  .string()
  .min(2, "Mínimo 2 caracteres")
  .max(100, "Máximo 100 caracteres")
  .regex(
    /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_\.&]+$/,
    "Solo letras, números y caracteres básicos"
  );

export const priceSchema = z.number().min(0).max(1_000_000).finite();

export const urlSchema = z
  .string()
  .url("URL inválida")
  .max(2048)
  .refine(
    (val) => val.startsWith("https://") || val.startsWith("http://"),
    "Debe ser una URL válida"
  );

export const createSOPSchema = z.object({
  title: textSchema,
  content: longTextSchema,
  department: z.enum([
    "ventas",
    "marketing",
    "operaciones",
    "finanzas",
    "general",
  ]),
  goal: textSchema,
});

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Datos inválidos";
}

const superAdminNameSchema = z
  .string()
  .trim()
  .min(1, "Campo requerido")
  .max(200, "Máximo 200 caracteres");

const superAdminNoteSchema = z
  .string()
  .trim()
  .min(1, "Campo requerido")
  .max(5000, "Máximo 5.000 caracteres");

const brainContentTypeSchema = z.enum([
  "document",
  "image",
  "transcript",
  "miro",
  "framework",
  "playbook",
]);

export const createFounderAccountSchema = z.object({
  organizationName: superAdminNameSchema,
  founderName: superAdminNameSchema,
  email: emailSchema,
});

export const createOrganizationFromHoldingSchema = z.object({
  name: superAdminNameSchema,
  founderEmail: emailSchema,
  plan: z.enum(["basic", "pro"]).optional(),
});

export const createHoldingOrgSchema = z.object({
  name: superAdminNameSchema,
  founderEmail: emailSchema,
});

export const setOrganizationStatusSchema = z.object({
  organizationId: uuidSchema,
  active: z.boolean(),
});

export const updateOrganizationMrrSchema = z.object({
  organizationId: uuidSchema,
  mrrUsd: moneySchema,
});

export const addOrganizationNoteSchema = z.object({
  organizationId: uuidSchema,
  note: superAdminNoteSchema,
  createdBy: z.string().trim().max(200, "Máximo 200 caracteres").optional(),
});

export const deactivateUserSchema = z.object({
  userId: uuidSchema,
});

export const prepareAiBrainFileUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "Campo requerido")
    .max(500, "Máximo 500 caracteres"),
  fileSize: z
    .number()
    .int("El tamaño debe ser un número entero")
    .positive("El tamaño debe ser mayor a 0")
    .max(AI_BRAIN_MAX_FILE_BYTES, "Archivo demasiado grande"),
  mimeType: z.string().trim().max(200, "Máximo 200 caracteres").optional(),
});

export const createAiBrainDocumentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Campo requerido")
      .max(500, "Máximo 500 caracteres"),
    contentType: brainContentTypeSchema,
    category: z
      .string()
      .trim()
      .min(1, "Campo requerido")
      .max(100, "Máximo 100 caracteres"),
    description: z.string().trim().max(5000, "Máximo 5.000 caracteres").optional(),
    tags: z.string().trim().max(2000, "Máximo 2.000 caracteres").optional(),
    coverageAreas: z
      .string()
      .trim()
      .max(2000, "Máximo 2.000 caracteres")
      .optional(),
    uploadedBy: z.string().trim().max(200, "Máximo 200 caracteres").optional(),
    miroUrl: z.string().trim().max(2048).optional(),
    storagePath: z.string().trim().max(1000, "Máximo 1.000 caracteres").optional(),
    fileName: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
    fileSizeBytes: z
      .number()
      .int()
      .nonnegative()
      .max(AI_BRAIN_MAX_FILE_BYTES)
      .optional(),
    fileMimeType: z.string().trim().max(200, "Máximo 200 caracteres").optional(),
  })
  .superRefine((data, ctx) => {
    const hasMiro = Boolean(data.miroUrl?.trim());
    const hasFile = Boolean(data.storagePath?.trim() && data.fileName?.trim());
    if (!hasMiro && !hasFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Subí un archivo o ingresá la URL de un tablero Miro.",
      });
    }
    if (data.miroUrl?.trim()) {
      const urlResult = urlSchema.safeParse(data.miroUrl.trim());
      if (!urlResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: firstZodError(urlResult.error),
          path: ["miroUrl"],
        });
      }
    }
  });

export const archiveAiBrainDocumentSchema = z.object({
  id: uuidSchema,
});

export const deleteAiBrainDocumentSchema = z.object({
  id: uuidSchema,
});

export const getAiBrainSignedUrlSchema = z.object({
  storagePath: z
    .string()
    .trim()
    .min(1, "Campo requerido")
    .max(1000, "Máximo 1.000 caracteres"),
});

export const regenerateTempPasswordSchema = z.object({
  userId: uuidSchema,
});

const holdingBusinessNameSchema = z
  .string()
  .trim()
  .min(1, "Campo requerido")
  .max(200, "Máximo 200 caracteres");

export const holdingFixedFeeCurrencySchema = z.enum(["USD", "ARS"]);

export const holdingBillingModelSchema = z.enum(["revenue_share", "fixed_fee"]);

export const addBusinessToMyHoldingSchema = z.object({
  businessName: holdingBusinessNameSchema,
  revenueSharePct: z.number().min(0).max(100).optional(),
  fixedFeeAmount: z.number().positive().max(1_000_000).optional(),
  fixedFeeCurrency: holdingFixedFeeCurrencySchema.optional(),
  founderEmail: emailSchema.optional(),
});

export const enterBusinessSchema = z.object({
  businessOrgId: uuidSchema,
});

export const regenerateBusinessFounderTempPasswordSchema = z.object({
  businessOrgId: uuidSchema,
});

export const saveHoldingBillingModelSchema = z.object({
  model: holdingBillingModelSchema,
});

export const businessInOnboardingSchema = z.object({
  name: holdingBusinessNameSchema,
  revenueSharePct: z.number().min(0).max(100).optional(),
  fixedFeeAmount: z.number().positive().max(1_000_000).optional(),
  fixedFeeCurrency: holdingFixedFeeCurrencySchema.optional(),
});

export const completeHoldingOnboardingSchema = z.object({
  businesses: z.array(businessInOnboardingSchema).min(1).max(50),
});

export const teamUserRoleSchema = z.enum([
  "founder",
  "admin",
  "project_manager",
  "setter",
  "operator",
  "viewer",
]);

export const permissionLevelSchema = z.enum(["none", "view", "full"]);

const permissionModuleIdSet = new Set<string>(
  PERMISSION_MODULES.map((m) => m.id)
);

export const teamPermissionsSchema = z
  .record(z.string(), permissionLevelSchema)
  .refine((perms) => Object.keys(perms).length > 0, "Definí al menos un permiso")
  .refine(
    (perms) =>
      Object.keys(perms).every((key) =>
        permissionModuleIdSet.has(key as PermissionModuleId)
      ),
    "Módulo de permiso no válido"
  );

export const passwordMinLengthSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(200, "Máximo 200 caracteres");

const teamPersonNameSchema = z
  .string()
  .trim()
  .min(1, "Campo requerido")
  .max(200, "Máximo 200 caracteres");

export const inviteTeamMemberSchema = z.object({
  email: emailSchema,
  fullName: teamPersonNameSchema,
  role: teamUserRoleSchema,
  customRoleId: uuidSchema.optional(),
});

export const updateMemberRoleSchema = z.object({
  memberId: uuidSchema,
  role: teamUserRoleSchema.optional(),
  customRoleId: z.union([uuidSchema, z.null()]).optional(),
  isActive: z.boolean().optional(),
});

export const deactivateMemberSchema = z.object({
  memberId: uuidSchema,
});

export const createCustomRoleSchema = z.object({
  name: teamPersonNameSchema,
  description: z.string().trim().max(1000, "Máximo 1.000 caracteres").optional(),
  permissions: teamPermissionsSchema,
});

export const deleteCustomRoleSchema = z.object({
  roleId: uuidSchema,
});

export const revokeInvitationSchema = z.object({
  invitationId: uuidSchema,
});

export const acceptInvitationSchema = z.object({
  token: z.string().trim().min(1, "Token inválido").max(500),
  fullName: teamPersonNameSchema,
  password: passwordMinLengthSchema,
});

export const completeInvitationForCurrentUserSchema = z.object({
  token: z.string().trim().min(1, "Token inválido").max(500),
});

export const organizationTimezoneSchema = z.enum([
  "America/Argentina/Buenos_Aires",
  "America/Mexico_City",
  "America/Bogota",
  "America/Santiago",
  "America/New_York",
  "Europe/Madrid",
  "UTC",
]);

export const organizationCurrencySchema = z.enum(["USD", "ARS", "EUR"]);

export const organizationLanguageSchema = z.enum(["es", "en"]);

export const updateOrganizationWebsiteSchema = z.object({
  websiteUrl: z.string().trim().max(500),
});

export const saveGeneralOrganizationSettingsSchema = z.object({
  orgName: z
    .string()
    .trim()
    .min(1, "El nombre de la empresa es obligatorio.")
    .max(200, "Máximo 200 caracteres"),
  industry: z.string().trim().max(200, "Máximo 200 caracteres").optional(),
  websiteUrl: z.string().trim().max(500),
  timezone: organizationTimezoneSchema.optional(),
  currency: organizationCurrencySchema.optional(),
  language: organizationLanguageSchema.optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  emailWeeklyReport: z.boolean().optional(),
  emailNewConversation: z.boolean().optional(),
  emailBookingConfirmed: z.boolean().optional(),
  emailSaleClosed: z.boolean().optional(),
  emailSopSuggestion: z.boolean().optional(),
  inappNewConversation: z.boolean().optional(),
  inappBookingConfirmed: z.boolean().optional(),
  inappSaleClosed: z.boolean().optional(),
  inappGhostingAlert: z.boolean().optional(),
});

export const saveClaudeApiKeySchema = z.object({
  apiKey: z.string().trim().min(1, "Ingresá una API key").max(500),
});

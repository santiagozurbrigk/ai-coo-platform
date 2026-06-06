import { z } from "zod";

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

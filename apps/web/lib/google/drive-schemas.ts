import { z } from "zod";

/** IDs de archivos en Google Drive: alfanuméricos, guiones y guiones bajos. */
export const googleDriveFileIdSchema = z
  .string()
  .trim()
  .min(10, "ID de Google inválido")
  .max(100, "ID de Google inválido")
  .regex(/^[a-zA-Z0-9_-]+$/, "ID de Google inválido");

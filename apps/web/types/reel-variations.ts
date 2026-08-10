/** Tipos para el módulo de Trial Reels — generación automática de 5 variantes de un reel */

export type ReelVariationType =
  | "speed_up"     // +25% velocidad (V1)
  | "speed_down"   // -15% velocidad (V2)
  | "music"        // reemplazo de música de fondo (V3)
  | "subtitles"    // subtítulos personalizados (V4)
  | "color";       // corrección colorimétrica / LUT (V5)

export type ReelVariationStatus =
  | "processing"
  | "ready"
  | "published"
  | "failed";

export type ReelJobStatus =
  | "pending"
  | "processing"
  | "preview_ready"
  | "publishing"
  | "done"
  | "failed";

export type ReelVariation = {
  type: ReelVariationType;
  /** Path en Supabase Storage (bucket trial-reels) */
  storage_path: string;
  /** URL firmada para preview */
  preview_url: string;
  /** Caption/descripción editable por el usuario */
  description: string;
  /** Hashtags editables */
  hashtags: string[];
  /** El usuario puede excluir variantes */
  included: boolean;
  status: ReelVariationStatus;
  /** ID del post publicado en Zernio */
  zernio_post_id: string | null;
  published_at: string | null;
  error: string | null;
};

export type ReelVariationJob = {
  id: string;
  organization_id: string;
  source_piece_id: string;
  status: ReelJobStatus;
  delay_hours: number;
  variations: ReelVariation[];
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

/** Payload enviado a QStash → worker de Fly.io */
export type ReelVariationJobPayload = {
  jobId: string;
  organizationId: string;
  sourcePieceId: string;
  /** Path del video fuente ya subido a Supabase Storage */
  sourceStoragePath: string;
  /** Nombre original del archivo (para metadatos) */
  sourceFileName: string;
  /** Caption original del reel para que la IA genere variantes */
  originalCaption: string | null;
};

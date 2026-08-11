export type ReelVariationType =
  | "speed_up"
  | "speed_down"
  | "music"
  | "subtitles"
  | "color";

export type ReelVariationStatus =
  | "processing"
  | "ready"
  | "published"
  | "failed";

export type ReelVariation = {
  type: ReelVariationType;
  storage_path: string;
  preview_url: string;
  description: string;
  hashtags: string[];
  included: boolean;
  status: ReelVariationStatus;
  zernio_post_id: string | null;
  published_at: string | null;
  error: string | null;
};

/** Payload recibido de QStash */
export type ReelVariationJobPayload = {
  jobId: string;
  organizationId: string;
  sourcePieceId: string;
  /** Fuente Drive (nuevo) — el worker descarga directamente con el token */
  driveFileId?: string;
  driveAccessToken?: string;  // Access token OAuth (válido ~1h desde la creación del job)
  driveMimeType?: string;
  /** Fuente Storage (legacy) — ruta en Supabase Storage bucket trial-reels */
  sourceStoragePath?: string;
  sourceFileName: string;
  originalCaption: string | null;
  /** Ruta en Storage (bucket trial-reels) del track de música personalizado de la org.
   *  Si está presente, el worker descarga este archivo antes de procesar la variante "music". */
  reelMusicPath?: string | null;
};

export type VariantSpec = {
  type: ReelVariationType;
  outputSuffix: string;
  buildFfmpegArgs: (
    inputPath: string,
    outputPath: string,
    lutsDir: string,
    originalCaption?: string | null,
    /** Ruta local absoluta del track de música personalizado (si existe). Overrides lutsDir/background-music.mp3 */
    customMusicPath?: string | null,
  ) => string[];
};

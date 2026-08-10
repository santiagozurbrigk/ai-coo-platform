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
  sourceStoragePath: string;
  sourceFileName: string;
  originalCaption: string | null;
};

export type VariantSpec = {
  type: ReelVariationType;
  outputSuffix: string;
  buildFfmpegArgs: (inputPath: string, outputPath: string, lutsDir: string) => string[];
};

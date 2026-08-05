export type ContentPieceType =
  | "reel"
  | "story"
  | "post"
  | "carousel"
  | "youtube"
  | "brief";

export type ContentPieceSource = "zernio" | "manual" | "ai_generated" | "google";

export type ContentPieceStatus =
  | "draft"
  | "approved"
  | "scheduled"
  | "published"
  | "archived";

export type ContentFormatType =
  | "storytime"
  | "talking_head"
  | "pov"
  | "listicle"
  | "green_screen"
  | "hot_take"
  | "carousel"
  | "otro";

export type ContentHookType =
  | "dolor_directo"
  | "curiosidad"
  | "contrarian"
  | "prueba_social"
  | "resultado";

export type ContentCtaType = "dm" | "comment_word" | "link" | "none";

export type ContentAnalysis = {
  formato: {
    name: string;
    description: string;
  };
  dolor: {
    name: string;
    description: string;
  };
  angulo: {
    name: string;
    description: string;
  };
  why_it_worked: string;
  video_structure: Array<{
    part: string;
    description: string;
    script_note?: string;
  }>;
  // Clasificación estructurada para patrones
  format_type?: ContentFormatType;
  hook_type?: ContentHookType;
  cta_type?: ContentCtaType;
};

export type ContentBrief = {
  formato: {
    name: string;
    description: string;
  };
  dolor: {
    name: string;
    description: string;
  };
  angulo: {
    name: string;
    description: string;
  };
  structure: Array<{
    part: string;
    description: string;
    example_script: string;
  }>;
};

export type ContentMetrics = {
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
  views?: number;
};

export type ContentSalesAttributed = {
  lead_count: number;
  scheduled_count: number;
  closed_count: number;
  total_revenue: number;
  last_attributed_at: string;
};

export type ContentPiece = {
  id: string;
  organization_id: string;
  type: ContentPieceType;
  source: ContentPieceSource;

  platform_post_id?: string;
  platform_post_url?: string;
  platform?: string;
  published_at?: string;

  title?: string;
  caption?: string;
  hashtags?: string[];
  thumbnail_url?: string;

  drive_file_id?: string;
  drive_file_name?: string;
  drive_file_url?: string;

  transcript?: string;
  analysis?: ContentAnalysis;
  analysis_generated_at?: string;

  variants_of?: string;
  brief?: ContentBrief;

  metrics?: ContentMetrics;
  metrics_updated_at?: string;

  sales_attributed?: ContentSalesAttributed;

  // Clasificación estructurada (columnas propias en DB)
  format_type?: ContentFormatType;
  hook_type?: ContentHookType;
  cta_type?: ContentCtaType;

  status: ContentPieceStatus;
  created_at: string;
  updated_at: string;
};

export type ContentPieceWithVariants = ContentPiece & {
  variants?: ContentPiece[];
};

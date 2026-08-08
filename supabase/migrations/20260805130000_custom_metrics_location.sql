-- Add display_location to custom_metrics
-- Allows founders to pin a metric to a specific screen

ALTER TABLE public.custom_metrics
  ADD COLUMN IF NOT EXISTS display_location text NOT NULL DEFAULT 'dashboard';

-- Index for location-based lookups (e.g. fetching only metrics for /clients)
CREATE INDEX IF NOT EXISTS custom_metrics_location_idx
  ON public.custom_metrics (organization_id, display_location, sort_order);

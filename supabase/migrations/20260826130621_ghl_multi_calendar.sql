-- Soporte multi-calendario en GHL integration
-- Agrega selected_calendar_ids para sincronizar más de un calendario a la vez.

ALTER TABLE ghl_integrations
  ADD COLUMN IF NOT EXISTS selected_calendar_ids text[] NOT NULL DEFAULT '{}'::text[];

-- Backfill: las filas existentes pasan su default_calendar_id al nuevo array.
UPDATE ghl_integrations
SET selected_calendar_ids = ARRAY[default_calendar_id]
WHERE default_calendar_id IS NOT NULL
  AND (selected_calendar_ids IS NULL OR array_length(selected_calendar_ids, 1) IS NULL OR array_length(selected_calendar_ids, 1) = 0);

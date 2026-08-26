-- Agrega la columna data_source a metrics_snapshots para distinguir
-- datos importados manualmente de datos generados por integraciones.
--
-- Valores posibles:
--   'manual_import'     -- el founder cargó los datos a mano en el wizard
--   'integration_sync'  -- un cron/integración los escribió automáticamente
--
-- Default 'manual_import' para compatibilidad con rows existentes.

ALTER TABLE metrics_snapshots
  ADD COLUMN IF NOT EXISTS data_source TEXT NOT NULL DEFAULT 'manual_import'
    CHECK (data_source IN ('manual_import', 'integration_sync'));

-- Índice para filtrar por origen (útil para queries de fallback)
CREATE INDEX IF NOT EXISTS metrics_snapshots_data_source_idx
  ON metrics_snapshots (organization_id, data_source, period_start DESC);

COMMENT ON COLUMN metrics_snapshots.data_source IS
  'Origen del snapshot: manual_import = cargado por el founder via wizard; integration_sync = generado automáticamente por una integración (Stripe, MP, Calendly, etc.)';

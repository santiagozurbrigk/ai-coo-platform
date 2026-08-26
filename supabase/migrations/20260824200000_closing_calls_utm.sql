-- Agrega columnas de atribución UTM a closing_calls
-- Fuente: attributionSource del contacto en GHL, o parámetros UTM del booking.

ALTER TABLE public.closing_calls
  ADD COLUMN IF NOT EXISTS utm_source    text,
  ADD COLUMN IF NOT EXISTS utm_medium    text,
  ADD COLUMN IF NOT EXISTS utm_campaign  text,
  ADD COLUMN IF NOT EXISTS utm_content   text,
  ADD COLUMN IF NOT EXISTS utm_term      text,
  ADD COLUMN IF NOT EXISTS ghl_contact_id text,
  ADD COLUMN IF NOT EXISTS attribution_source jsonb;
  -- attribution_source guarda el objeto crudo de GHL para referencia futura

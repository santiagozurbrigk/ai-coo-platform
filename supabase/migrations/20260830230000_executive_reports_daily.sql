-- Reportes ejecutivos: sumar la cadencia diaria
--
-- La tabla nació con `period` limitado a 'weekly' y 'monthly'. El documento
-- `Funnel Metrics Standard v1.0` (§06) define **tres** cadencias y le da a cada
-- una un propósito distinto:
--
--   Diario   "Pulse"    — spend, leads, CPL, bookings, roturas obvias.
--                         Lectura de 5 minutos. NO se toman decisiones con un
--                         solo día de datos.
--   Semanal  "Steering" — show rate, close rate, CAC, ROAS. Acá se mueve
--                         presupuesto y se cortan creativos.
--   Mensual  "Truth"    — ROAS blended, LTV:CAC, retención, cash collected.
--                         Los números que ve el cliente.
--
-- El diario faltaba. Esta migración sólo abre el CHECK; el generador y su cron
-- viven en el código.

ALTER TABLE public.executive_reports
  DROP CONSTRAINT IF EXISTS executive_reports_period_check;

ALTER TABLE public.executive_reports
  ADD CONSTRAINT executive_reports_period_check
  CHECK (period IN ('daily', 'weekly', 'monthly'));

-- El índice existente ya cubre (organization_id, period, period_start DESC),
-- que es exactamente la consulta del panel: el último reporte de cada cadencia.

COMMENT ON COLUMN public.executive_reports.period IS
  'Cadencia del reporte: daily (pulso), weekly (dirección) o monthly (verdad). Las tres se generan solas por cron; no hay generación manual.';

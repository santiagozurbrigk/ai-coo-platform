-- I-2 del plan de integraciones — ver docs/FUNNELS_SOURCE_MAP.md §5
--
-- Capa de pagos según el documento fuente, que asigna a **Whop / Fanbasis** el
-- "AOV, cash collected, refunds" (§05).
--
-- Stripe y Mercado Pago siguen existiendo en el repo para el módulo de Finanzas
-- y la importación manual, pero NO son la fuente de la etapa Cash del embudo.
--
-- LA DISTINCIÓN QUE MANDA EL MODELO: el documento separa lo contratado de lo
-- cobrado — "Contracted revenue is a promise; cash collected pays the ad
-- account". Por eso hay dos tablas: `payment_orders` guarda el compromiso y
-- `payment_transactions` el dinero que efectivamente entró (o salió, en un
-- reembolso).

-- ─── Credenciales por org ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payment_integrations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  provider              text NOT NULL CHECK (provider IN ('whop', 'fanbasis')),
  api_key_encrypted     text,
  webhook_secret_encrypted text,
  external_account_id   text,
  is_active             boolean NOT NULL DEFAULT true,
  connected_at          timestamptz NOT NULL DEFAULT now(),
  last_event_at         timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, provider)
);

-- Sin políticas de RLS a propósito: la tabla guarda secretos y sólo se lee
-- desde el servidor con service role, igual que el resto de las tablas de
-- integraciones del repo (ver CLAUDE.md §6).
ALTER TABLE public.payment_integrations ENABLE ROW LEVEL SECURITY;

-- ─── Órdenes: el compromiso ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  provider             text NOT NULL CHECK (provider IN ('whop', 'fanbasis')),
  external_id          text NOT NULL,
  customer_external_id text,
  customer_email       text,
  -- M29: valor contratado. Es la promesa completa, no lo cobrado.
  contract_value       numeric(14, 2) NOT NULL DEFAULT 0,
  currency             text NOT NULL DEFAULT 'USD',
  product_name         text,
  is_recurring         boolean NOT NULL DEFAULT false,
  status               text,
  ordered_at           timestamptz NOT NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, provider, external_id)
);

CREATE INDEX IF NOT EXISTS payment_orders_org_date_idx
  ON public.payment_orders (organization_id, ordered_at DESC);
CREATE INDEX IF NOT EXISTS payment_orders_customer_idx
  ON public.payment_orders (organization_id, customer_external_id);

-- ─── Transacciones: el dinero real ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  provider             text NOT NULL CHECK (provider IN ('whop', 'fanbasis')),
  external_id          text NOT NULL,
  order_external_id    text,
  customer_external_id text,
  customer_email       text,
  -- 'payment' suma a cash collected; 'refund' resta (M28 y M30).
  kind                 text NOT NULL CHECK (kind IN ('payment', 'refund')),
  -- Siempre positivo: el signo lo da `kind`, no el monto.
  amount               numeric(14, 2) NOT NULL,
  currency             text NOT NULL DEFAULT 'USD',
  occurred_at          timestamptz NOT NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, provider, external_id)
);

CREATE INDEX IF NOT EXISTS payment_transactions_org_date_idx
  ON public.payment_transactions (organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS payment_transactions_order_idx
  ON public.payment_transactions (organization_id, order_external_id);

-- ─── Eventos crudos ───────────────────────────────────────────────────────────
--
-- Guarda el webhook tal como llegó, ANTES de intentar interpretarlo.
--
-- Existe por una razón concreta: el shape exacto de los payloads de Whop y
-- Fanbasis no está verificado contra sus APIs reales. Persistir el evento crudo
-- hace que el primer webhook de verdad de cada proveedor sea la fuente de verdad
-- para corregir el mapeo, en vez de tener que adivinarlo. Además, un evento que
-- hoy no se sabe interpretar no se pierde: queda para reprocesar.

CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations (id) ON DELETE CASCADE,
  provider        text NOT NULL CHECK (provider IN ('whop', 'fanbasis')),
  event_type      text,
  external_event_id text,
  payload         jsonb NOT NULL,
  -- 'pending' | 'processed' | 'unmapped' | 'error'
  status          text NOT NULL DEFAULT 'pending',
  error_message   text,
  received_at     timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz
);

CREATE INDEX IF NOT EXISTS payment_webhook_events_status_idx
  ON public.payment_webhook_events (provider, status, received_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS payment_webhook_events_dedupe_idx
  ON public.payment_webhook_events (provider, external_event_id)
  WHERE external_event_id IS NOT NULL;

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.payment_orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read their payment_orders" ON public.payment_orders;
CREATE POLICY "org members read their payment_orders"
  ON public.payment_orders FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members read their payment_transactions" ON public.payment_transactions;
CREATE POLICY "org members read their payment_transactions"
  ON public.payment_transactions FOR SELECT
  USING (organization_id = public.get_my_organization_id());

-- `payment_webhook_events` queda sin políticas: contiene payloads crudos que
-- pueden traer datos personales del comprador. Sólo servidor.

COMMENT ON TABLE public.payment_orders IS
  'Compromiso de compra: valor contratado. Whop y Fanbasis, que son los que el documento fuente asigna a la etapa Cash.';
COMMENT ON TABLE public.payment_transactions IS
  'Dinero que efectivamente se movió. kind=payment suma a cash collected, kind=refund resta. El monto es siempre positivo.';
COMMENT ON TABLE public.payment_webhook_events IS
  'Webhooks crudos tal como llegaron. El primer evento real de cada proveedor es la fuente de verdad para corregir el mapeo, que hoy no está verificado contra sus APIs.';

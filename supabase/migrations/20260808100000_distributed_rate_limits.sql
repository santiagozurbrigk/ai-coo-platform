-- Contador de rate limiting compartido entre instancias serverless.
-- Reemplaza el Map en memoria de apps/web/lib/rate-limit.ts, que en Vercel
-- se reinicia en cada cold start y no se comparte entre lambdas.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 0,
  reset_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limits_reset_at_idx
  ON public.rate_limits (reset_at);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- Sin policies: solo accesible con service role desde el servidor.

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key text,
  p_window_ms integer,
  p_max_requests integer
)
RETURNS TABLE (allowed boolean, remaining integer, reset_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_window interval := make_interval(secs => p_window_ms / 1000.0);
  v_count integer;
  v_reset timestamptz;
BEGIN
  INSERT INTO public.rate_limits AS rl (key, count, reset_at)
  VALUES (p_key, 1, v_now + v_window)
  ON CONFLICT (key) DO UPDATE
    SET count = CASE
          WHEN rl.reset_at <= v_now THEN 1
          -- Se corta en max+1: pasado el límite no hace falta seguir contando.
          ELSE least(rl.count + 1, p_max_requests + 1)
        END,
        reset_at = CASE
          WHEN rl.reset_at <= v_now THEN v_now + v_window
          ELSE rl.reset_at
        END
  RETURNING rl.count, rl.reset_at INTO v_count, v_reset;

  -- Limpieza oportunista de ventanas vencidas (1 de cada 100 llamadas).
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits WHERE reset_at < v_now - interval '1 hour';
  END IF;

  RETURN QUERY
    SELECT v_count <= p_max_requests,
           greatest(p_max_requests - v_count, 0),
           v_reset;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM public;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM anon;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;

-- El límite de intentos del login se estaba cayendo en silencio.
--
-- ⭐ `consume_rate_limit` declara una columna de salida `reset_at`, y adentro
-- hacía `DELETE FROM rate_limits WHERE reset_at < ...` sin calificar. Postgres
-- no puede decidir entre las dos y corta con:
--
--     column reference "reset_at" is ambiguous
--
-- La aplicación atrapa ese error y se cae a un contador **en memoria**. O sea:
-- el límite deja de estar compartido entre servidores, cada lambda cuenta por
-- su cuenta, y en la práctica el techo real pasa a ser varias veces el que dice
-- la configuración. Un control de seguridad que cree estar funcionando.
--
-- Sólo saltaba en el 1% de las llamadas —la limpieza es oportunista—, así que
-- aparecía de a poco y sin patrón. Se encontró leyendo los logs de producción.
create or replace function public.consume_rate_limit(p_key text, p_window_ms integer, p_max_requests integer)
returns table(allowed boolean, remaining integer, reset_at timestamp with time zone)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_now timestamptz := now();
  v_window interval := make_interval(secs => p_window_ms / 1000.0);
  v_count integer;
  v_reset timestamptz;
begin
  insert into public.rate_limits as rl (key, count, reset_at)
  values (p_key, 1, v_now + v_window)
  on conflict (key) do update
    set count = case
          when rl.reset_at <= v_now then 1
          -- Se corta en max+1: pasado el límite no hace falta seguir contando.
          else least(rl.count + 1, p_max_requests + 1)
        end,
        reset_at = case
          when rl.reset_at <= v_now then v_now + v_window
          else rl.reset_at
        end
  returning rl.count, rl.reset_at into v_count, v_reset;

  -- El alias `rl` y la columna calificada son el arreglo.
  if random() < 0.01 then
    delete from public.rate_limits rl where rl.reset_at < v_now - interval '1 hour';
  end if;

  return query
    select v_count <= p_max_requests,
           greatest(p_max_requests - v_count, 0),
           v_reset;
end;
$function$;

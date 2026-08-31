-- Hechos de onboarding de TODAS las organizaciones, en una consulta.
--
-- POR QUÉ. El panel de super-admin necesita saber en qué punto quedó cada
-- organización. Resolverlas una por una serían ocho consultas por organización
-- —doscientas con veinticinco clientes— para pintar una sola pantalla.
--
-- QUÉ DEVUELVE Y QUÉ NO DECIDE. Devuelve **hechos**, no conclusiones. Quién
-- está trabado, qué ítem falta y si el gate aplica lo sigue decidiendo
-- `deriveOnboardingState` en TypeScript, que es puro y está testeado. Esta
-- función no duplica ni una regla de negocio.
--
-- EL CASO DE LOS EMBUDOS. Cuántos pasos tiene una plantilla vive en el código
-- (`lib/funnels/templates/`), no en la base. Por eso se devuelve el detalle
-- crudo —cada instancia con su plantilla y cuántos bindings tiene— y la app
-- resuelve si está completa. Hardcodear los conteos acá sería una segunda
-- fuente de verdad de las plantillas, que es justo lo que la arquitectura de
-- embudos evita.

create or replace function public.onboarding_org_progress()
returns table (
  organization_id uuid,
  organization_name text,
  account_type text,
  org_status text,
  skip_onboarding boolean,
  created_at timestamptz,
  currency text,
  timezone text,
  industry text,
  country text,
  founder_email text,
  member_count integer,
  has_core_offer boolean,
  has_primary_avatar boolean,
  connected_source_count integer,
  funnels jsonb,
  historical_snapshot_count integer,
  indexed_document_count integer,
  gate_completed_at timestamptz,
  dismissed_items text[],
  tours_seen text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    o.name,
    o.account_type,
    o.status,
    coalesce(o.skip_onboarding, false),
    o.created_at,
    o.currency,
    o.timezone,
    o.industry,
    o.country,
    (select p.email from profiles p
      where p.organization_id = o.id and p.role = 'founder'
      order by p.created_at limit 1),
    (select count(*)::integer from profiles p where p.organization_id = o.id),
    exists (select 1 from products pr
      where pr.organization_id = o.id and pr.is_core_offer),
    exists (select 1 from customer_avatars a
      where a.organization_id = o.id and a.is_primary),
    public.onboarding_connected_source_count(o.id),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'templateId', fi.template_id,
        'bound', (select count(*) from funnel_step_bindings b
                   where b.funnel_instance_id = fi.id)
      ))
      from funnel_instances fi
      where fi.organization_id = o.id and fi.is_active
    ), '[]'::jsonb),
    (select count(*)::integer from metrics_snapshots m
      where m.organization_id = o.id),
    (select count(*)::integer from business_context_documents d
      where d.organization_id = o.id and d.status = 'indexed'),
    os.gate_completed_at,
    coalesce(os.dismissed_items, '{}'),
    coalesce(os.tours_seen, '{}')
  from organizations o
  left join onboarding_state os on os.organization_id = o.id
  order by o.created_at;
$$;

-- Recorre todas las organizaciones y saltea RLS: sólo el service role, que es
-- con lo que corren las pantallas de super-admin.
revoke all on function public.onboarding_org_progress() from public;
revoke all on function public.onboarding_org_progress() from authenticated;
revoke all on function public.onboarding_org_progress() from anon;
grant execute on function public.onboarding_org_progress() to service_role;

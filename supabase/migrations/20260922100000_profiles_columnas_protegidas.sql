-- Perfiles: un usuario ya no puede cambiarse de organización ni de rol.
--
-- ⭐ El agujero: la policy "Users update own profile" (20260606100000) es
-- `USING (id = auth.uid()) WITH CHECK (id = auth.uid())` y no limita columnas.
-- Con la anon key pública y su propio JWT, cualquier usuario registrado podía
-- hacer `PATCH /rest/v1/profiles?id=eq.<yo>` con
-- `{"organization_id":"<otra org>","role":"founder"}` y pasar a ser founder de
-- otra organización: `get_my_organization_id()` y `requireOrganizationId()` leen
-- justamente esas dos columnas.
--
-- La regla: cuando la escritura viene de un usuario (roles `authenticated` o
-- `anon` de PostgREST):
--   1. `id`, `organization_id`, `role`, `is_holding_admin`,
--      `must_change_password` y `temp_password_expires_at` no cambian nunca. La app los escribe con el
--      service role (alta de miembros, holding, contraseñas temporales).
--   2. Sobre su propio perfil, un usuario que no es founder/admin sólo puede
--      cambiar `full_name`, `email` y `avatar_url` (`app/profile/actions.ts`).
--   3. Un founder/admin conserva lo que ya hacía con el cliente de usuario:
--      tarifas (`hourly_rate*`), comisión, `custom_role_id`, `is_active`.
--
-- Las escrituras con service role (`createAdminClient`) y las migraciones no
-- pasan por esta regla.

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
-- SECURITY INVOKER a propósito: dentro de una función SECURITY DEFINER
-- `current_user` es el dueño de la función y la regla no vería nunca al usuario.
security invoker
set search_path = public
as $$
declare
  v_caller_role text;
  v_self_editable constant text[] := array['full_name', 'email', 'avatar_url', 'updated_at'];
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.organization_id is distinct from old.organization_id
     or new.role is distinct from old.role
     or new.must_change_password is distinct from old.must_change_password
     or new.temp_password_expires_at is distinct from old.temp_password_expires_at
     or new.is_holding_admin is distinct from old.is_holding_admin
  then
    raise exception 'profiles: columna protegida (id, organization_id, role, is_holding_admin o contraseña temporal)'
      using errcode = '42501';
  end if;

  select p.role into v_caller_role
  from public.profiles p
  where p.id = auth.uid()
    and p.organization_id = old.organization_id;

  if v_caller_role in ('founder', 'admin') then
    return new;
  end if;

  if (to_jsonb(new) - v_self_editable) is distinct from (to_jsonb(old) - v_self_editable) then
    raise exception 'profiles: sólo podés editar tu nombre, email y avatar'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row
  execute function public.protect_profile_columns();

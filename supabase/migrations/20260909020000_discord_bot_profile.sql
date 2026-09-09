-- Perfil del bot de Discord por servidor: el nombre y la foto que ve el cliente.
--
-- ⭐ El problema que resuelve. La pantalla de Discord ya ofrecía "Nombre del
-- bot" y lo guardaba en `bot_name`, pero ese valor sólo se usaba **dentro del
-- texto** del saludo ("Hola, soy X, el asistente del equipo"). El nombre que
-- Discord muestra al lado de cada mensaje seguía siendo el de la aplicación,
-- igual para todos los clientes. O sea: la pantalla prometía algo que Discord
-- no cumplía, y el usuario no tenía forma de saberlo salvo mirando su servidor.
--
-- Discord permite un perfil POR SERVIDOR para el bot —apodo, foto, banner y
-- bio— vía `PATCH /guilds/{guild.id}/members/@me`. Para bots quedó habilitado
-- recién en septiembre de 2025 (discord/discord-api-docs#3881, abierto desde
-- 2021); antes de eso la única salida era una aplicación de Discord por cliente.

-- ─── El default arrastraba la marca vieja ───────────────────────────────────
--
-- El barrido del rebrand tocó el código, no los defaults de la base: cualquier
-- organización que conectara Discord después del rebrand se llevaba un bot que
-- se presentaba como "Asistente OTC". La única fila que existe en producción ya
-- estaba corregida a mano, así que esto no repara nada visible hoy — evita que
-- vuelva a aparecer con el próximo cliente que conecte.
alter table public.discord_integrations
  alter column bot_name set default 'Asistente Limitless';

update public.discord_integrations
   set bot_name = 'Asistente Limitless',
       updated_at = now()
 where bot_name = 'Asistente OTC';

-- ─── La foto, y el registro de lo que Discord efectivamente aceptó ──────────
--
-- ⭐ `bot_profile_error` no es decorativo. Aplicar el perfil puede fallar por
-- una razón que sólo se ve del lado de Discord —típicamente que al bot le falte
-- el permiso «Cambiar apodo», que las instalaciones anteriores a este cambio
-- nunca otorgaron—. Sin esta columna el rechazo viviría nada más en un toast
-- que se va: al recargar, la pantalla volvería a mostrar el nombre "guardado"
-- mientras en el servidor sigue el viejo. Exactamente el modo de falla que
-- costó media sesión diagnosticar con la clave de Supabase.
alter table public.discord_integrations
  add column if not exists bot_avatar_url text,
  add column if not exists bot_profile_applied_at timestamptz,
  add column if not exists bot_profile_error text;

comment on column public.discord_integrations.bot_profile_applied_at is
  'Última vez que Discord aceptó el perfil (apodo o foto). NULL = nunca se aplicó.';
comment on column public.discord_integrations.bot_profile_error is
  'Motivo del último rechazo de Discord. NULL = el perfil está aplicado.';

-- ─── Storage: la foto es pública ────────────────────────────────────────────
--
-- Es el logo que el cliente ve al lado de cada mensaje del bot en su Discord:
-- no hay nada que proteger, y una URL pública evita firmar cada lectura.
--
-- Los formatos son más acotados que en el bucket `avatars` a propósito: Discord
-- acepta **sólo** JPG, PNG y GIF como data URI (Reference → Image Data). WebP
-- se puede leer de su CDN pero no subir, así que permitirlo acá sería dejar
-- entrar un archivo que Discord después rechaza con un 400 opaco.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'discord-bot-avatars',
  'discord-bot-avatars',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/gif']
)
on conflict (id) do nothing;

-- Path: {organization_id}/bot.{ext} — mismo esquema que el bucket `avatars`.
drop policy if exists "Org members insert discord bot avatars" on storage.objects;
create policy "Org members insert discord bot avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'discord-bot-avatars'
    and (storage.foldername(name))[1] = public.get_my_organization_id()::text
  );

drop policy if exists "Org members update discord bot avatars" on storage.objects;
create policy "Org members update discord bot avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'discord-bot-avatars'
    and (storage.foldername(name))[1] = public.get_my_organization_id()::text
  )
  with check (
    bucket_id = 'discord-bot-avatars'
    and (storage.foldername(name))[1] = public.get_my_organization_id()::text
  );

drop policy if exists "Org members delete discord bot avatars" on storage.objects;
create policy "Org members delete discord bot avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'discord-bot-avatars'
    and (storage.foldername(name))[1] = public.get_my_organization_id()::text
  );

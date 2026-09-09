import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ⭐ El cliente se crea **la primera vez que se usa**, no al importar el módulo.
 *
 * Antes se creaba arriba de todo, y eso pasaba antes de que `index.ts` pudiera
 * validar las variables de entorno: si faltaba `SUPABASE_URL`, en vez del
 * mensaje que dice cuáles faltan salía un `supabaseUrl is required` de la
 * librería, con un stack de veinte líneas y sin decir qué hacer.
 *
 * `realtime` no se usa: el bot escucha Discord, no la base. Se deja el cliente
 * con la sesión desactivada, que es lo correcto para una service role key.
 */
let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return client;
}

/**
 * Que tipo de clave esta usando el bot, sin imprimirla nunca.
 *
 * ⭐ Es la unica forma de detectar el fallo mas silencioso de todos. El bot
 * **necesita la service role key**, que saltea RLS. Si en su lugar se carga la
 * clave publica (anon / publishable), pasa esto:
 *
 *   - Supabase acepta la conexion sin quejarse.
 *   - RLS filtra por `get_my_organization_id()`, que sin sesion es NULL.
 *   - Toda consulta devuelve **cero filas y ningun error**.
 *
 * O sea: el bot arranca perfecto, se conecta al servidor correcto, pregunta a la
 * base correcta, y jura que la integracion no existe. No hay nada en el log que
 * lo delate — porque desde el punto de vista del cliente no paso nada malo.
 *
 * Las claves JWT (`eyJ...`) llevan el rol en su payload; las nuevas lo llevan en
 * el prefijo (`sb_secret_` / `sb_publishable_`). Se leen los dos formatos.
 */
type TipoDeClave = { rol: string; sirve: boolean };

export function describirClave(): TipoDeClave {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return { rol: "sin definir", sirve: false };

  if (key.startsWith("sb_secret_")) return { rol: "secreta", sirve: true };
  if (key.startsWith("sb_publishable_")) {
    return { rol: "publishable", sirve: false };
  }

  const payload = key.split(".")[1];
  if (!payload) return { rol: "formato desconocido", sirve: false };

  try {
    const { role } = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { role?: string };
    return { rol: role ?? "sin rol", sirve: role === "service_role" };
  } catch {
    return { rol: "ilegible", sirve: false };
  }
}

/**
 * Host de Supabase al que apunta el bot, para poder nombrarlo en los mensajes.
 *
 * Es el dato que decide el diagnostico mas confuso de todos: el bot conectado a
 * **otra base** se comporta igual que el bot con la base vacia. Todas las
 * consultas devuelven nada, sin error, y desde afuera parece que la integracion
 * no existe. Decir contra que host se pregunto convierte media hora de conjeturas
 * en una linea de log.
 *
 * Es un host publico, no un secreto: la service role key nunca se imprime.
 */
export function supabaseHost(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) return "(SUPABASE_URL sin definir)";
  try {
    return new URL(url).host;
  } catch {
    return `(SUPABASE_URL invalida: ${url})`;
  }
}

/**
 * Registra el error de una consulta en vez de descartarlo.
 *
 * ⚠️ Toda la capa de lectura hacia `const { data } = await db()...` tiraba el
 * `error` a la basura. Cuando una consulta fallaba, el bot se comportaba
 * exactamente igual que si no hubiera datos: se iba en silencio, sin responder
 * y sin dejar rastro. Diagnosticar eso desde afuera es imposible — no hay
 * diferencia observable entre "no hay integración" y "la consulta falló".
 *
 * `.single()` además da error cuando hay **cero** filas, que en varias de estas
 * consultas es un caso normal: por eso se distingue `PGRST116` y no se reporta
 * como falla.
 */
function reportarError(donde: string, error: { code?: string; message: string } | null) {
  if (!error) return;
  if (error.code === "PGRST116") return; // Sin filas: caso esperado.
  console.error(`[supabase] ${donde}: ${error.message}`);
}

export async function getOrgByGuildId(guildId: string) {
  const { data, error } = await db()
    .from("discord_integrations")
    .select("*, organizations(*)")
    .eq("guild_id", guildId)
    .eq("status", "connected")
    .maybeSingle();
  reportarError(`getOrgByGuildId(${guildId})`, error);
  if (!data) {
    console.warn(
      `[discord] Ningún servidor conectado con guild_id ${guildId} en ` +
        `${supabaseHost()}. O el servidor no está vinculado en Limitless, o el ` +
        `bot está mirando otra base: ese host tiene que ser el mismo proyecto ` +
        `de Supabase que usa la aplicación.`
    );
  }
  return data;
}

export async function getClientLink(
  organizationId: string,
  discordUserId: string
) {
  const { data, error } = await db()
    .from("discord_client_links")
    .select("*, clients(*)")
    .eq("organization_id", organizationId)
    .eq("discord_user_id", discordUserId)
    .maybeSingle();
  reportarError("getClientLink", error);
  return data;
}

export async function saveMessage(message: {
  organization_id: string;
  client_id: string | null;
  discord_message_id: string;
  discord_user_id: string;
  discord_username: string;
  discord_display_name: string;
  guild_id: string;
  channel_id: string;
  channel_name: string;
  content: string;
  message_type: string;
  is_testimonial: boolean;
  attachments: { url: string; type: string; name: string | null }[];
  sent_at: Date;
}) {
  const { error } = await db()
    .from("discord_messages")
    .upsert(message, { onConflict: "discord_message_id" });

  if (error) console.error("Error saving message:", error);
}

export async function saveClientLink(link: {
  organization_id: string;
  client_id: string;
  discord_user_id: string;
  discord_username: string;
  discord_display_name: string;
  link_method: string;
  link_confidence: number;
}) {
  const { error } = await db()
    .from("discord_client_links")
    .upsert(link, { onConflict: "organization_id,discord_user_id" });

  if (error) console.error("Error saving link:", error);
}

export async function getClients(organizationId: string) {
  const { data } = await db()
    .from("clients")
    .select("id, name, nickname, email")
    .eq("organization_id", organizationId);
  return data || [];
}

export async function getClientByEmail(
  email: string,
  organizationId: string
) {
  const { data } = await db()
    .from("clients")
    .select("id, name")
    .eq("organization_id", organizationId)
    .ilike("email", email)
    .single();
  return data;
}

export async function savePendingChannel(data: {
  organization_id: string;
  guild_id: string;
  channel_id: string;
  channel_name: string;
}) {
  await db()
    .from("discord_pending_channels")
    .upsert(data, { onConflict: "channel_id" });
}

export async function isChannelMonitored(
  guildId: string,
  channelId: string
): Promise<boolean> {
  const { data, error } = await db()
    .from("discord_integrations")
    .select("monitored_channels")
    .eq("guild_id", guildId)
    .maybeSingle();
  reportarError("isChannelMonitored", error);

  if (!data) return false;

  const channels = (data.monitored_channels as { channel_id: string }[]) || [];
  const monitored = channels.some((c) => c.channel_id === channelId);
  if (!monitored) {
    console.log(
      `[discord] Canal ${channelId} sin monitorear: se ignora el mensaje.`
    );
  }
  return monitored;
}

export async function channelMatchesAutoPattern(
  guildId: string,
  channelName: string
): Promise<{ matches: boolean; integration: Record<string, unknown> | null }> {
  const { data } = await db()
    .from("discord_integrations")
    .select("*")
    .eq("guild_id", guildId)
    .single();

  if (!data) return { matches: false, integration: null };

  const pattern = (data.auto_monitor_pattern as string) || "cliente-";
  const matches = channelName.toLowerCase().includes(pattern.toLowerCase());
  return { matches, integration: data };
}

export async function addMonitoredChannel(
  guildId: string,
  channel: {
    channel_id: string;
    channel_name: string;
    purpose: string;
  }
) {
  const { data } = await db()
    .from("discord_integrations")
    .select("monitored_channels")
    .eq("guild_id", guildId)
    .single();

  if (!data) return;

  const existing =
    (data.monitored_channels as { channel_id: string }[]) || [];
  if (existing.some((c) => c.channel_id === channel.channel_id)) return;

  const updated = [
    ...existing,
    { ...channel, added_at: new Date().toISOString() },
  ];

  await db()
    .from("discord_integrations")
    .update({ monitored_channels: updated, updated_at: new Date().toISOString() })
    .eq("guild_id", guildId);
}

export async function touchIntegrationEvent(guildId: string) {
  await db()
    .from("discord_integrations")
    .update({
      last_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("guild_id", guildId);
}

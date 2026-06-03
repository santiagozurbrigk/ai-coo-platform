# Phase 2 — Roadmap y especificaciones

**Estado:** Planificación — **no implementar en Phase 1**  
**Última actualización:** mayo 2026  
**Referencia cruzada:** `docs/ESTADO_PLATAFORMA.md` · `docs/PHASE_1.md` · `docs/SYSTEM_ARCHITECTURE.md`

---

## Objetivo de Phase 2

Extender el sistema operativo con **contexto completo del cliente** (llamadas + comunidad), automatización avanzada de marketing/operaciones, y diferenciadores de producto que no existen en CRMs genéricos.

Phase 1 prioriza auth, DB, RLS, integraciones core (ManyChat, Calendly, Fathom, formularios, contenido). Phase 2 añade capacidades de **alto valor percibido** y bajo costo incremental donde el ICP ya opera (Discord).

---

## Prioridades Phase 2 (resumen)

| Prioridad | Feature | Por qué |
|-----------|---------|---------|
| **Alta** | [Integración Discord](#integración-discord-bot) | Complementa Fathom; ICP infoproductos; costo ~$0/cliente |
| Media | Testimonios automáticos + vista dedicada | Marketing y prueba social |
| Media | Timeline cliente unificado (Fathom + Discord) | Single source of truth |
| Baja | Super Admin: alertas por `requires_attention` | Operaciones OTC |

---

## Integración Discord (Bot)

### Problema que resuelve

Los founders de infoproductos usan **Discord** como canal principal con clientes: preguntas, soporte, avances, testimonios, comunidad. Hoy el software no tiene visibilidad de esas interacciones.

| Fuente | Qué captura |
|--------|-------------|
| **Fathom** | Contexto de llamadas |
| **Discord** | Contexto de chats y comunidad |

Combinados → visión completa por cliente.

### Lo que el bot captura

- Mensajes de clientes en canales monitoreados
- Testimonios en canales designados
- Preguntas y problemas reportados
- Reacciones (señales de satisfacción)
- Actividad general del cliente en el servidor
- Roles del usuario (nivel/etapa del programa)

---

## Arquitectura técnica

### Patrón (igual que ManyChat)

```
Una sola app de Discord (equipo OTC)
        ↓
Cada founder invita el bot a su servidor
        ↓
Bot escucha canales seleccionados
        ↓
Mensajes → webhook → software (Vercel)
        ↓
IA procesa y actualiza perfil del cliente
```

### Stack

| Componente | Tecnología |
|------------|------------|
| Bot | `discord.js` (Node.js) |
| Hosting bot | **Railway** (proceso separado de Vercel) |
| Base de datos | Supabase (existente) |
| Comunicación | Webhooks internos bot ↔ API Next.js |

### Proyecto Railway: `otc-discord-bot`

```
Runtime: Node.js
Costo estimado: $5–10/mes (todos los clientes)
```

**Variables de entorno (Railway):**

```env
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
OTC_WEBHOOK_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

**Variables de entorno (Vercel / `apps/web`):**

```env
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_WEBHOOK_SECRET=
DISCORD_REDIRECT_URI=https://<dominio>/api/integrations/discord/oauth/callback
```

---

## Migraciones Supabase (Phase 2)

```sql
-- Integración de Discord por organización
CREATE TABLE discord_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) UNIQUE,
  guild_id text NOT NULL,
  guild_name text,
  bot_token_encrypted text,
  monitored_channels jsonb,
  -- [{ channel_id, channel_name, purpose: 'clients'|'testimonials'|'general' }]
  status text DEFAULT 'connected',
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Vinculación usuario Discord ↔ cliente
CREATE TABLE discord_client_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  client_id uuid REFERENCES clients(id),
  discord_user_id text NOT NULL,
  discord_username text,
  discord_display_name text,
  linked_at timestamptz DEFAULT now(),
  link_method text,
  -- 'email_match' | 'code' | 'manual'
  UNIQUE(organization_id, discord_user_id)
);

-- Mensajes capturados
CREATE TABLE discord_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  client_id uuid REFERENCES clients(id) NULLABLE,
  discord_message_id text UNIQUE,
  discord_user_id text,
  discord_username text,
  channel_id text,
  channel_name text,
  content text,
  message_type text DEFAULT 'message',
  -- 'message' | 'testimonial' | 'question' | 'issue'
  reactions jsonb,
  attachments jsonb,
  ai_sentiment text NULLABLE,
  ai_category text NULLABLE,
  ai_summary text NULLABLE,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS en todas: acceso por organization_id = get_my_organization_id()
```

---

## Flujo de onboarding del bot

### Desde Integraciones → Discord

1. **Conectar** — El software genera link OAuth bot:  
   `discord.com/oauth2/authorize?client_id=...&permissions=...&scope=bot`
2. **Autorizar** — Founder selecciona servidor y permisos en Discord.
3. **Detectar guild** — Evento `guildCreate` → guardar `guild_id` / `guild_name` en `discord_integrations`.
4. **Seleccionar canales** — UI lista canales; founder marca propósito:
   - `#clientes` → Clientes
   - `#testimonios` → Testimonios
   - `#soporte` → Clientes
   - `#team` → No monitorear
5. **Vinculación** — Bot sugiere en canal:  
   `!vincular email@ejemplo.com` → match en `clients` o cola manual.

---

## Lógica de vinculación de clientes

Orden de prioridad:

```typescript
async function linkDiscordUserToClient(
  discordUserId: string,
  discordDisplayName: string,
  organizationId: string,
  emailProvided?: string
): Promise<LinkResult> {
  // 1. Por email (más preciso)
  if (emailProvided) {
    const client = await findClientByEmail(emailProvided, organizationId);
    if (client) return { method: 'email_match', clientId: client.id };
  }

  // 2. Por nombre fuzzy (igual que Fathom)
  const clients = await getClients(organizationId);
  const matches = fuzzyMatchClients(discordDisplayName, clients);
  if (matches.length === 1 && matches[0].confidence > 0.85) {
    return { method: 'auto_name', clientId: matches[0].id };
  }

  // 3. Cola de revisión manual
  return { method: 'pending_review', candidates: matches };
}
```

---

## Procesamiento de mensajes con IA

### Clasificación (Claude Haiku)

```typescript
const DISCORD_MESSAGE_PROMPT = `
Analiza este mensaje de Discord de un cliente de un negocio de infoproductos.

CLIENTE: {clientName}
CANAL: {channelName}
MENSAJE: {content}

Responde SOLO en JSON:
{
  "category": "progress_update | testimonial | question | issue | general",
  "sentiment": "positive | neutral | negative",
  "summary": "resumen en una oración en español",
  "is_testimonial": true/false,
  "requires_attention": true/false,
  "attention_reason": "por qué requiere atención o null"
}
`;
// trackTokenUsage() en cada llamada
```

### Detección de testimonios

Un mensaje es testimonio si:

1. La IA lo clasifica como `testimonial`, o  
2. El canal tiene `purpose === 'testimonials'`, o  
3. Contiene keywords: *gracias, logré, conseguí, resultados, increíble, recomiendo, funciona, cambió, transformó, mejoró, escalé, facturé*.

---

## Impacto en módulos existentes

### Clientes — `/clients/[id]`

Nueva sección **Actividad en Discord**: avatar, username, último mensaje, total, sentiment, mensajes recientes con categoría y flags.

### Timeline del cliente

Eventos Discord junto a llamadas Fathom (misma línea temporal).

### Super Admin — Salud de clientes

Mensajes con `requires_attention: true` como alertas adicionales.

### Nuevo sub-módulo (opcional)

`/clients/testimonials` — Lista de testimonios detectados; marcar usado/destacado; export para marketing.

---

## API y endpoints

### Bot (Railway) → Vercel

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/api/discord/message` | Mensaje entrante (auth: `DISCORD_WEBHOOK_SECRET`) |
| POST | `/api/discord/link-request` | Flujo `!vincular email` |

### Vercel (software)

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/api/discord/message` | Persistir + encolar IA |
| POST | `/api/discord/link-request` | Vincular por email |
| GET | `/api/discord/channels/[guildId]` | Listar canales para configuración |
| POST | `/api/integrations/discord/oauth/callback` | OAuth → `discord_integrations` |

---

## UI — Card en Integraciones

**Ruta:** `/integrations`

```
Discord
"Conectá tu servidor para capturar conversaciones con clientes,
detectar testimonios automáticamente y tener visibilidad
completa de cada cliente."

Estado: Próximamente (Phase 2) | No conectado cuando live

[ Conectar Discord ]  — deshabilitado hasta Phase 2

Cuando conectado:
  Servidor: [Nombre]
  Canales monitoreados: X
  Clientes vinculados: X / Y
  Mensajes capturados: X
  Testimonios detectados: X
  Última sync: hace X min
  [ Configurar canales ] [ Gestionar vínculos ]
```

---

## Estimación de costo

| Ítem | Costo |
|------|-------|
| Discord API | Gratis (uso normal) |
| Railway (bot) | $5–10/mes total |
| Claude Haiku (~200 msg/cliente/mes) | ~$0.008/cliente/mes |
| 20 clientes | ~$0.16/mes IA |

**Incremental por cliente:** prácticamente $0.

---

## Por qué alta prioridad en Phase 2

1. Complementa Fathom (llamadas + chats = contexto completo).
2. Diferenciador de mercado.
3. Bajo costo técnico y operacional.
4. Alto valor percibido (testimonios automáticos).
5. ICP: casi todos los infoproductos usan Discord para comunidad.

---

## Lo que NO hacer en Phase 1

- No crear código del bot (`discord.js`, Railway).
- No crear tablas `discord_*` en Supabase.
- No implementar OAuth Discord real (solo card «Próximamente» en UI).
- No configurar Railway.

Solo documentación y referencia en roadmap.

---

## Criterios de completado (implementación Phase 2)

Cuando se ejecute Phase 2:

- [ ] Migraciones `discord_integrations`, `discord_client_links`, `discord_messages` + RLS
- [ ] Servicio Railway `otc-discord-bot` desplegado
- [ ] OAuth + selección de canales en `/integrations`
- [ ] Endpoints API con `DISCORD_WEBHOOK_SECRET`
- [ ] Vinculación `!vincular` + fuzzy + cola manual
- [ ] Clasificación Haiku + `trackTokenUsage`
- [ ] Sección Discord en detalle de cliente + timeline
- [ ] (Opcional) `/clients/testimonials`
- [ ] Super Admin: alertas `requires_attention`

---

*Documento de planificación. Actualizar al iniciar Phase 2.*

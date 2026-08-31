# PLAN_AGENT_RUNTIME.md — Reverse engineering de Buzz (Block) y qué se puede llevar a OTC

**Fecha:** 2026-08-31 · **Rama:** `Claude-claudeplanconection` · **Estado:** plan, sin código todavía

Documento de decisión. Responde tres preguntas: qué hace Buzz realmente, qué de eso es
legal replicar, y qué conviene construir en OTC.

**Fuentes:** código clonado de [`block/buzz`](https://github.com/block/buzz) (Apache-2.0) y
[`agentclientprotocol/claude-agent-acp`](https://github.com/agentclientprotocol/claude-agent-acp)
(Apache-2.0, autor **Zed Industries**), más la política de Anthropic en
[code.claude.com/docs/en/legal-and-compliance](https://code.claude.com/docs/en/legal-and-compliance).
Todo lo que sigue está verificado contra el código, no contra resúmenes.

---

## 0. El titular

**La pregunta "¿cómo hace Buzz para usar la cuenta Claude Pro/Max del usuario?" tiene
respuesta, y la respuesta es que OTC no puede copiarla.**

No porque sea técnicamente difícil, sino porque la política de Anthropic la permite
**sólo en la forma en que Buzz la hace** —una app de escritorio que corre el binario de
Claude Code sin modificar en la máquina del usuario— y prohíbe explícitamente la forma en
que OTC tendría que hacerla, que es desde un servidor.

Lo bueno: **OTC hoy ya está del lado correcto** (BYOK con API key, el modo OAuth quedó
retirado en `credential-types.ts`), y lo que sí vale la pena robarle a Buzz es la
arquitectura de agentes, que es independiente del problema de credenciales.

---

## 1. Qué es Buzz, verificado en el código

La cadena de procesos que reconstruimos es correcta:

```
Buzz Desktop (Tauri/React)
   │ spawn — desktop/src-tauri/src/managed_agents/runtime.rs
   ▼
buzz-acp (Rust)                    ← identidad Nostr, relay WS, cola, concurrencia
   │ spawn + JSON-RPC sobre stdio — crates/buzz-acp/src/acp.rs:462
   ▼
claude-agent-acp (Node, de Zed)    ← traduce ACP ⇄ Claude Agent SDK
   │ @anthropic-ai/claude-agent-sdk 0.3.238
   ▼
binario nativo de Claude Code      ← publicado por Anthropic, sin modificar
   ▼
Anthropic
```

Son tres procesos distintos, y el Desktop efectivamente **nunca ejecuta el agente
directamente**: lanza `buzz-acp` y le pasa `BUZZ_ACP_AGENT_COMMAND` para que el spawn
ocurra una capa más abajo.

### Los métodos ACP que Buzz realmente usa

Contados sobre `crates/buzz-acp/src/acp.rs`:

| Método | Dirección | Uso |
|---|---|---|
| `initialize` | → agente | negocia versión y capacidades; **devuelve `authMethods`** |
| `authenticate` | → agente | autenticación (ver §2) |
| `session/new` | → agente | crea sesión, con servidores MCP opcionales |
| `session/prompt` | → agente | manda el turno |
| `session/update` | ← agente | streaming de tokens, tool calls, thinking |
| `session/cancel` | → agente | corta el turno (idle timeout / `!cancel`) |
| `session/request_permission` | ← agente | el agente pide permiso para una tool |
| `session/set_model` | → agente | **cambia el modelo** |
| `session/set_config_option` | → agente | config por sesión |

ACP es JSON-RPC 2.0 sobre stdio. Hay SDK oficial de TypeScript
(`@agentclientprotocol/sdk`, que el propio adapter usa), así que **un bridge no
necesita escribirse en Rust**.

### Corrección a la investigación previa

Tres cosas del análisis original hay que ajustarlas, y las tres importan:

1. **El model picker sí tiene un canal.** El adapter implementa `session/set_model` y lee
   `ANTHROPIC_MODEL`. Si en Buzz el modelo elegido no llega al runtime, es un bug de Buzz,
   no una limitación de la arquitectura.

2. **`claude-agent-acp` no lee ninguna credencial.** Se grepeó su árbol entero: sus lecturas
   de `process.env` no incluyen `CLAUDE_CODE_OAUTH_TOKEN` ni `~/.claude/.credentials.json`.
   **Cero.** Toda la autenticación queda delegada al binario de Claude Code
   (`pathToClaudeCodeExecutable`, `acp-agent.ts:6885`). La supuesta "discrepancia entre dos
   mecanismos de auth" no está en el adapter — está en el probe propio de Buzz.

3. **El binario no es de Buzz.** `claudeCliPath()` (`acp-agent.ts:1239`) resuelve el binario
   nativo como **dependencia opcional por plataforma de `@anthropic-ai/claude-agent-sdk`**,
   o `CLAUDE_CODE_EXECUTABLE` si está seteado. Es el binario publicado por Anthropic, sin
   modificar. Esto no es un detalle de packaging: es exactamente la condición de la que
   depende la legalidad de todo el esquema.

### El hallazgo que no estaba: `--hide-claude-auth`

```ts
// src/acp-agent.ts:1287
function shouldHideClaudeAuth(): boolean {
  return process.argv.includes("--hide-claude-auth");
}
```

Cuando ese flag está presente, el adapter hace dos cosas:

- **oculta** el método de login "Claude Subscription" del `initialize` (`:1648`, `:1686`);
- y si aun así la cuenta resuelta tiene `subscriptionType`, **aborta la sesión**
  (`:6988`):

  ```ts
  throw RequestError.authRequired(
    undefined,
    "This integration does not support using claude.ai subscriptions.",
  );
  ```

Es un **interruptor de cumplimiento** puesto ahí para que las integraciones que *no* tienen
permitido usar suscripciones lo apaguen. Buzz no lo pasa: `grep -rn "hide-claude-auth"` sobre
todo el repo de Buzz devuelve **cero resultados**. Buzz habilita el login por suscripción a
propósito.

### Cómo se autentica el usuario, en concreto

El adapter no toma credenciales. Publica en `initialize` un `authMethod` de tipo `terminal`:

```ts
{ id: "claude-ai-login", name: "Claude Subscription",
  type: "terminal", args: ["--cli", "auth", "login", "--claudeai"] }
```

El cliente ACP **abre una terminal y corre ese comando**. El login ocurre dentro del flujo
propio de Anthropic, en la máquina del usuario. Buzz nunca ve el token.

Ése es todo el truco. No hay conversión de Pro/Max a API: hay un binario de Anthropic
logueándose contra Anthropic, en la computadora del usuario, y un protocolo por stdio
alrededor.

---

## 2. El límite legal, textual

De [Legal and compliance](https://code.claude.com/docs/en/legal-and-compliance),
sección *Authentication and credential use*:

> **Anthropic does not permit third-party developers to offer Claude.ai login into their own
> applications, or to route requests through Free, Pro, or Max plan credentials on behalf of
> their users. Moreover, developers may not collect, store, or intermediate Claude.ai
> credentials or session tokens — sign-in to a Claude account must complete through
> Anthropic's own flow.**

Y de la sección *Agent SDK overview*:

> Unless previously approved, Anthropic does not allow third party developers to offer
> claude.ai login or rate limits for their products, including agents built on the Claude
> Agent SDK. Use the API key authentication methods instead.

**Pero existe una excepción explícita, y es la que habilita a Buzz:**

> Nor does it prevent an end user from signing in to the **unmodified Claude Code binary**
> with their own Claude subscription, including where a platform hosts Claude Code as
> described under *Can customers offer Claude Code in their products?*

Con estas condiciones, de esa misma sección:

- **El binario no se modifica.** No se puede quitar, deshabilitar ni restringir ningún
  método de autenticación que traiga.
- **No se puede pagar, revender ni intermediar el uso de Claude por cuenta del usuario final.**
  Cada usuario se autentica con su propia credencial y se le factura directamente a él.
- **Marca:** se puede decir en texto plano que el producto corre Claude Code. No se puede
  usar "Claude Code" ni "Anthropic" en el nombre del producto, feature o logo.
  Permitido: `"{Nombre} Powered by Claude"`.

### Traducido a OTC

| Diseño | ¿Permitido? | Por qué |
|---|---|---|
| OTC web ↔ API key de la org (**lo que hay hoy**) | ✅ | Es exactamente el método recomendado |
| OTC web guarda el OAuth de Claude del usuario | ❌ | "may not collect, store, or intermediate" |
| OTC server proxea la inferencia con la suscripción del usuario | ❌ | "route requests through Free/Pro/Max on behalf of their users" |
| OTC web ofrece "Iniciá sesión con Claude" | ❌ | "offer Claude.ai login into their own applications" |
| **Companion local** que corre Claude Code sin modificar, login por el flujo de Anthropic, credenciales que nunca salen de la máquina | ✅ | Es la excepción del binario sin modificar — el caso Buzz |

La línea es **dónde vive la credencial y quién hace la llamada**. Si el token toca un
servidor de OTC, o si un proceso de OTC hace la request a Anthropic con la suscripción del
usuario, está prohibido. Si el binario de Anthropic corre en la máquina del usuario y OTC
sólo ve mensajes y resultados, está permitido.

Esto no es una interpretación conservadora: Anthropic desplegó bloqueo del lado del servidor
en enero de 2026 y agregó la política explícita en febrero de 2026. No es un riesgo teórico,
es enforcement activo.

### Estado actual de OTC: correcto

`apps/web/lib/ai/credential-types.ts` ya retiró el modo OAuth:

```ts
/** Normaliza modos legacy de OAuth a flujo de API key. */
export function normalizeCredentialMode(_dbMode, hasValidApiKey) {
  return hasValidApiKey ? "api_key_active" : "unconfigured";
}
```

y `credential-resolver.ts` sólo lee `claude_api_key_encrypted`. **No hay nada que corregir.**
Lo único a vigilar es que nadie reviva la migración OAuth (#19) que quedó mencionada en un
comentario.

---

## 3. Qué sí vale la pena de Buzz

Sacando el tema de credenciales, Buzz resuelve problemas que **el agente de OTC hoy no
resuelve**, y ahí sí hay algo para llevarse.

El agente de OTC (`lib/agent/stream-agent-message.ts`) es un agente *hosted*: llama a la API
de Anthropic con tools que pegan a Supabase. No necesita filesystem ni shell. Copiar la
cadena de tres procesos de Buzz sería arquitectura de adorno. Lo que sí falta:

| Lo que Buzz tiene | Dónde está | Qué le falta a OTC |
|---|---|---|
| **Runtime intercambiable** | ACP como frontera | El agente está casado con `lib/ai/anthropic.ts`. Cambiar de proveedor toca el streaming entero |
| **Agente como entidad configurable** | `managed_agents/types.rs` (system prompt, modelo, timeouts, parallelism, allowlist) | OTC tiene *un* agente, con prompt fijo, igual para todas las orgs |
| **Ciclo de vida de sesión** | `pool.rs`, `queue.rs` — idle timeout, `max_turn_duration`, respawn, "un prompt en vuelo por canal" | El agente de OTC no tiene ninguno de los tres. Un turno colgado se cuelga |
| **Tools por MCP** | `BUZZ_ACP_MCP_COMMAND`, un server MCP por subproceso | Las tools están hardcodeadas dentro del streaming |
| **Disparo por evento** | menciones del relay Nostr | El agente de OTC sólo reacciona a que alguien escriba en `/agent` |

**La pieza con mejor relación valor/costo es MCP.** Exponer los datos de OTC —clientes,
contenido, métricas, SOPs, embudos— como un **servidor MCP** hace tres cosas de una vez:

1. Desacopla las tools del loop de streaming.
2. Las hace consumibles por cualquier runtime (Claude, Codex, el agente hosted de OTC).
3. **Si algún día se hace el companion local, ya está construido el canal por el que el
   Claude Code del usuario lee los datos de su negocio.** Es la misma pieza.

Es la única inversión que sirve igual en los tres escenarios del §4.

---

## 4. Las tres opciones

### A — Quedarse en BYOK (statu quo)
Ya está construido y es compliant. La org pone su API key de Anthropic, se le factura a
ella. **Costo: cero. Techo: el usuario paga aparte de su Pro/Max.**

### B — Abstraer el runtime + MCP, sin tocar credenciales
Meter una interfaz `AgentRuntime` entre OTC y el proveedor, y mover las tools a un servidor
MCP. Se gana lo del §3 sin acercarse al límite legal. Sigue corriendo en el servidor con API
key. **Costo: medio. Es lo que recomiendo.**

⚠️ Con una restricción de infraestructura: las funciones de Vercel tienen tope de duración y
un agente con tools puede pasarse. El pool de agentes de largo aliento **no entra en Vercel**
— necesita un worker aparte (o QStash, que ya se usa para RAG).

### C — Companion local ("usá tu Claude Pro/Max")
El único camino compliant para lo que originalmente se quería. Requiere:

- Un binario que el usuario instala (Tauri, o un CLI `npx otc-agent`).
- Corre `claude-agent-acp` → Claude Code **sin modificar**.
- Login por el flujo propio de Anthropic (`--cli auth login --claudeai`).
- Las credenciales **nunca** salen de la máquina; OTC ve mensajes y resultados, no tokens.
- OTC **no** proxea inferencia ni revende uso.
- Aceptar los Commercial Terms of Service y cumplir la guía de marca.

**Costo: alto** — distribución, firma de código, autoupdate, soporte de Windows/macOS/Linux,
y un canal servidor↔companion. Es un producto nuevo al lado de OTC, no un feature.

---

## 5. Recomendación

**Hacer B ahora. Dejar C como opción abierta, y construir B de modo que C sea un runtime más
y no una reescritura.**

El razonamiento: C sólo se justifica si "no quiero pagar API aparte" es la objeción que
frena ventas. Hasta que eso esté medido con clientes reales, C es mucho trabajo para una
hipótesis. B, en cambio, se paga solo —timeouts, cancelación, agentes por org, tools
desacopladas— aunque C nunca se haga.

Y la frontera que propone Buzz es la correcta, aun sin ACP:

```
                         OTC (Next.js)
                              │
                     ┌────────▼─────────┐
                     │  AgentRuntime    │   ← interfaz, no implementación
                     └────────┬─────────┘
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      HostedClaudeRuntime   (futuro)     LocalAcpRuntime
      API key de la org    OpenAI/etc    companion + ACP
              │                               │
              └──────────────┬────────────────┘
                             ▼
                    OTC MCP server (tools)
```

```ts
interface AgentRuntime {
  id: string;
  createSession(opts: SessionOpts): Promise<Session>;
  prompt(s: Session, msg: PromptInput): AsyncIterable<AgentEvent>;
  cancel(s: Session): Promise<void>;
  dispose(s: Session): Promise<void>;
}
```

`AgentEvent` conviene modelarlo con la forma de `session/update` de ACP —token, thinking,
tool_call, tool_result, done, error— porque es la que ya tiene el SSE de OTC
(`lib/agent/sse.ts`) y además es la que hablaría un runtime ACP el día que exista. Sale
gratis alinearlas ahora.

**No adoptar ACP como protocolo interno todavía.** ACP existe para hablar con procesos
ajenos por stdio. Entre módulos del mismo proceso de Next.js es serialización sin
contrapartida. Lo que se adopta ahora es *la forma de sus eventos*; el protocolo entra
recién con el companion.

---

## 6. Plan por fases

### Fase 1 — Frontera del runtime (sin cambio de comportamiento)
- `lib/agent/runtime/types.ts` — `AgentRuntime`, `Session`, `AgentEvent` con forma ACP.
- `lib/agent/runtime/hosted-claude.ts` — envuelve lo que hoy hace `stream-agent-message.ts`.
- `stream-agent-message.ts` pasa a orquestar contra la interfaz.
- Tests en `lib/agent/runtime/__tests__/`.
- **Criterio de salida:** `/agent` se comporta igual, `pnpm test` verde, cero cambios de UI.

### Fase 2 — Ciclo de vida de sesión
Traer las tres cosas que Buzz sí tiene y OTC no:
- `idleTimeout` — cancelar tras N segundos sin evento (Buzz: 620s).
- `maxTurnDuration` — tope absoluto de pared (Buzz: 7200s).
- **Un turno en vuelo por conversación** — hoy dos envíos concurrentes en la misma
  conversación pisan el historial.
- Cancelación real desde la UI (`session/cancel`), que hoy no existe.

### Fase 3 — Tools a MCP
Mover las tools del agente a un servidor MCP de OTC. Empezar por las de sólo lectura
(clientes, contenido, métricas, SOPs) y dejar las de escritura para después de definir
permisos. **Es la fase que más rinde**: es la única pieza que sirve idéntica en B y en C.

### Fase 4 — Agente configurable por org
Con la interfaz puesta, exponer por org: system prompt, modelo, timeouts, qué tools ve.
Aprovecha el multi-tenant que ya existe (`organization_id` + RLS).

### Fase 5 (condicional) — Companion local
**Sólo si se valida la demanda.** Antes de escribir una línea:
1. Confirmar con Anthropic (contact-sales) el caso de uso concreto.
2. Aceptar Commercial ToS.
3. Revisar marca: OTC no puede llamarse ni presentarse como Claude Code.

Después: CLI mínimo (`npx @otc/agent-bridge`) antes que app de escritorio. Un CLI se prueba
en una tarde; un Tauri firmado y con autoupdate es un trimestre.

---

## 7. Qué NO copiar de Buzz

- **Nostr y el relay.** Buzz lo necesita porque su producto *es* identidad criptográfica
  distribuida. OTC tiene Supabase con RLS y multi-tenant resuelto. Meter Nostr sería
  arrastrar el problema de otro producto.
- **La cadena de tres procesos**, mientras el agente sea hosted. Sin filesystem ni shell,
  no hay nada que aislar.
- **El pool de subprocesos paralelos** (`BUZZ_ACP_AGENTS`, 1–32). Resuelve concurrencia de
  procesos locales. En serverless el problema no existe.
- **Rust.** Hay SDK de ACP en TypeScript; el companion, si se hace, va en TS.

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Que alguien reviva el OAuth de Claude en OTC | Test de regresión que falle si `normalizeCredentialMode` devuelve un modo OAuth |
| Fase 1 rompe `/agent` en silencio | Refactor sin cambio de comportamiento + tests antes de tocar el streaming |
| Agentes de larga duración no entran en Vercel | Definir el worker **antes** de la Fase 2, no después |
| La política de Anthropic cambia otra vez | Releer `legal-and-compliance` antes de arrancar la Fase 5 |
| MCP de escritura sin permisos | Fase 3 arranca sólo lectura, a propósito |

---

## 9. Lo que queda sin verificar

- **Duración real de un turno del agente de OTC** contra el tope de Vercel. Decide si la
  Fase 2 necesita worker o no. Medible hoy con los logs.
- **Si "no quiero pagar API aparte" es objeción real de venta.** Es lo único que justifica
  la Fase 5. Nadie lo midió.
- **Si Anthropic aprobaría el caso de OTC** vía contact-sales. Sin preguntar.

---

## 10. Resumen

Buzz no descubrió una forma de convertir Pro/Max en API. Convirtió Claude Code en un runtime
intercambiable detrás de ACP, y dejó que el binario de Anthropic —sin modificar, en la
máquina del usuario— maneje la autenticación. Eso es legal **por ser local**, y esa
propiedad es justamente la que una web SaaS no tiene.

Para OTC: la arquitectura de agentes de Buzz vale la pena y se puede llevar entera; el
esquema de credenciales no se puede llevar, y OTC hoy ya está bien parado. La inversión que
sirve en cualquier escenario es la frontera `AgentRuntime` más las tools en MCP.

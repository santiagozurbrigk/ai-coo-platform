# Desplegar el bot de Discord — runbook

> **Para Santiago.** El bot está escrito entero y no corre en ningún lado. Esto
> es **operación, no código**: son cuatro pasos y ninguno requiere programar.
>
> Escrito el 2026-09-03 (Encargo E, fase D1).

---

## Por qué el bot es un proceso aparte y no una función de Vercel

Vale entenderlo una vez porque explica todo lo demás.

Los "webhooks" de Discord son **salientes**: sirven para mandarle mensajes a
Discord, no para recibirlos. Para que el bot **lea** los mensajes de un canal hay
que mantener abierta una conexión permanente (el *Gateway*), que es un programa
corriendo las 24 horas.

Vercel apaga las funciones cuando terminan de responder, así que no puede
sostener esa conexión. **No es una decisión de arquitectura revisable: es cómo
funciona Discord.** Por eso el bot va en Railway y el resto de OTC en Vercel.

---

## Paso 1 · Activar el intent MESSAGE CONTENT 🔴

**Es el paso que más fácil se saltea y el que más caro sale.**

1. Entrá a <https://discord.com/developers/applications>
2. Elegí tu app → **Bot** (menú de la izquierda)
3. Bajá hasta **Privileged Gateway Intents**
4. Prendé **MESSAGE CONTENT INTENT** → **Save Changes**

**Qué pasa si no lo hacés:** el bot no arranca. Va a escribir en el log de
Railway el mensaje exacto de qué falta —eso lo dejé preparado— así que si te lo
olvidás lo vas a ver enseguida en vez de estar adivinando.

> **El techo, para que lo sepas desde ahora:** este intent es gratis hasta **100
> servidores**. Pasado ese número, Discord exige verificar la app, y eso lleva
> semanas. No es un problema hoy; es algo para tener anotado antes de crecer.

**Los otros dos intents no hay que tocarlos.** El bot pedía también SERVER
MEMBERS, que es privilegiado y **no usaba para nada**: lo saqué, así tenés un
permiso menos que activar y una cosa menos que puede fallar.

---

## Paso 2 · Copiar el token del bot

En la misma pantalla: **Bot → Reset Token → Copy**.

⚠️ **Se muestra una sola vez.** Si lo perdés, se resetea y hay que volver a
cargarlo en Railway.

---

## Paso 3 · Desplegar en Railway

1. Entrá a <https://railway.app> → **New Project** → **Deploy from GitHub repo**
2. Elegí el repo `ai-coo-platform`
3. 🔴 **En Settings → Source, poné `Root Directory` = `apps/discord-bot`.**

   **Este es el paso que hace fallar el build si falta**, y el error no lo dice:
   sin root directory, Railway mira la raíz del repo, encuentra el monorepo con
   Next.js, intenta construirlo con su detector automático y falla con un
   mensaje sobre Nx y `RAILPACK_NX_APP` que no tiene nada que ver con el bot.

   El bot es **standalone**: no importa ningún paquete del workspace, y su
   Dockerfile espera que el contexto sea su propia carpeta. Con el root
   directory puesto, Railway lee `apps/discord-bot/railway.json` —que ya dice
   que use el Dockerfile— y no hay nada más que configurar en Build.

4. En **Variables**, cargá estas cinco:

| Variable | De dónde sale |
|---|---|
| `DISCORD_BOT_TOKEN` | Paso 2 |
| `SUPABASE_URL` | Dashboard de Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Mismo lugar. **Es la service role, no la anon** |
| `OTC_API_URL` | La URL pública de OTC, sin barra al final |
| `OTC_WEBHOOK_SECRET` | **El mismo valor** que ya tenés en Vercel |

**Las cinco son obligatorias.** Si falta alguna el bot no arranca y te dice cuál
—antes fallaba en silencio con las dos últimas, que ahora también se validan.

**Cómo sabés que anduvo:** en los logs de Railway tiene que aparecer una línea de
"ready". Si aparece un error, va a decir qué hacer.

**Si el build falla antes de arrancar** y el log habla de Nx, de Next.js o de
`RAILPACK_SPA_OUTPUT_DIR`, es el paso 3: Railway está construyendo el monorepo
entero en vez del bot.

---

## Paso 4 · Instalar el bot en un servidor

Esto ya está construido en OTC: **Integraciones → Discord → Conectar**. Te lleva
a Discord, elegís el servidor y listo.

Necesita que `NEXT_PUBLIC_DISCORD_CLIENT_ID` esté seteada en Vercel (es el
**Application ID** del portal de Discord, no el token).

Los permisos que pide son los mínimos: ver el canal, escribir y leer el
historial. Nada más.

---

## Cómo verificás que D1 quedó bien

**No alcanza con que el bot esté "verde" en Railway.** La prueba real:

1. Escribí un mensaje cualquiera en un canal monitoreado del servidor
2. Mirá la tabla `discord_messages` en Supabase
3. Tiene que aparecer una fila **con la columna `content` llena**

⚠️ **Si `content` viene vacío, el intent del Paso 1 no está activado.** Ese es el
modo de falla peligroso: el bot parece andar, guarda filas, y todas están en
blanco.

---

## Antes de instalarlo en el servidor de un cliente 🔴

**Esto no es técnico, es una decisión que conviene tomar antes y no después.**

El bot **lee y guarda mensajes de personas que no son usuarias de OTC** — los
clientes de tu cliente. Hoy hace dos cosas bien: guarda sólo los canales que
marcaste como monitoreados, y se presenta cuando se crea un canal nuevo.

Lo que falta decidir:

- **Cuánto tiempo se guardan** los mensajes. Hoy: para siempre.
- **Que quede escrito** en algún lado visible que el servidor está siendo
  registrado por una herramienta.

Es una conversación de cinco minutos, pero mejor tenerla antes de que haya
mensajes de terceros guardados.

---

*Runbook de la fase D1. Las fases D2 (actividad y silencio) y D3 (testimonios,
sentimiento y propuestas) son código y están en `CHANGES.md`.*

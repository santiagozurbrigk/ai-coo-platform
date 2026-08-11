# reel-worker

Worker de Fly.io para generación automática de variaciones de reels con FFmpeg.

## Qué hace

Recibe jobs de QStash enviados desde `apps/web` y:

1. **Descarga** el video fuente desde Supabase Storage (`trial-reels` bucket)
2. **Genera 5 variantes** con FFmpeg:
   - `V1` — Velocidad +25% (`setpts=0.8*PTS + atempo=1.25`)
   - `V2` — Velocidad -15% (`setpts=1.15*PTS + atempo=0.87`)
   - `V3` — Reemplazo de música de fondo
   - `V4` — Subtítulos quemados (drawtext)
   - `V5` — LUT de color cálido (`lut3d` o `eq`)
3. **Reescribe metadatos** de cada variante (anti-fingerprint):
   - `creation_time`, `encoder`, `make`, `model` falsificados
   - Strip de metadatos originales (`-map_metadata -1`)
   - Bitrate variado ±5%
   - Crop de 1-2px aleatorio
4. **Sube** cada variante a Supabase Storage y genera signed URLs de preview (7 días)
5. **Genera captions** variados con Claude Haiku para cada variante
6. **Actualiza** el job en DB como `preview_ready`

## Deploy en Fly.io

### Pre-requisitos

```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# Autenticarse
fly auth login
```

### Primera vez

```bash
cd apps/reel-worker

# Crear la app en Fly.io (solo la primera vez)
fly apps create otc-reel-worker

# Configurar secrets
fly secrets set \
  SUPABASE_URL="<url-del-proyecto>" \
  SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
  ANTHROPIC_API_KEY="<anthropic-key>" \
  QSTASH_CURRENT_SIGNING_KEY="<qstash-current-key>" \
  QSTASH_NEXT_SIGNING_KEY="<qstash-next-key>"

# Deploy
fly deploy
```

### Actualizaciones

```bash
cd apps/reel-worker
fly deploy
```

### Recursos de LUTs y música

Colocar los siguientes archivos en `luts/`:

- `warm.cube` — LUT de color cálido para la variante V5
- `background-music.mp3` — Música de fondo para la variante V3

Sin estos archivos, las variantes usan fallbacks (eq filter y silencio respectivamente).

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Service role (bypass RLS) |
| `ANTHROPIC_API_KEY` | Sí | Para generación de captions con Haiku |
| `QSTASH_CURRENT_SIGNING_KEY` | Sí (prod) | Verificación de firmas QStash |
| `QSTASH_NEXT_SIGNING_KEY` | Sí (prod) | Verificación de firmas QStash |
| `PORT` | No | Puerto HTTP (default: 8080) |

## Endpoints

- `GET /health` — Health check (Fly.io lo usa para liveness)
- `POST /` — Recibe job de QStash y lo procesa async

## Desarrollo local

```bash
cd apps/reel-worker
pnpm install

# Requiere FFmpeg instalado localmente
ffmpeg -version

# Dev con hot-reload
pnpm dev
```

El endpoint local es `http://localhost:8080` — QStash puede apuntar aquí vía ngrok.

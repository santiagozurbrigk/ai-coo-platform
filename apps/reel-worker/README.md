# reel-worker

Worker de Fly.io para generación automática de variaciones de reels con FFmpeg.

## Qué hace

Recibe jobs de QStash enviados desde `apps/web` y:

1. **Descarga** el video fuente desde Supabase Storage (`trial-reels` bucket)
2. **Genera 5 variantes** con FFmpeg:
   - `V1` — Velocidad +25% (`setpts=0.8*PTS + atempo=1.25`)
   - `V2` — Velocidad -15% (`setpts=1.15*PTS + atempo=0.87`)
   - `V3` — Música de fondo mezclada al 20% (`processor.ts` prevé la música propia de la org, pero `jobPayloadSchema` no declara `reelMusicPath` y zod la descarta: hoy sólo usaría `luts/background-music.mp3`, que no está, así que conserva el audio original; ver `[TRIAL-REELS-MUSICA]`)
   - `V4` — Subtítulos quemados (drawtext)
   - `V5` — LUT de color cálido (`lut3d` o `eq`)
3. **Reescribe metadatos** de cada variante (anti-fingerprint):
   - `creation_time`, `encoder`, `make`, `model` falsificados (y `comment` vacío)
   - Strip de metadatos originales (`-map_metadata -1`)
   - Bitrate variado ±5% sobre 4 Mbps (fijo por variante)
   - Crop de 1-2px (fijo por variante, no aleatorio)
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
  QSTASH_NEXT_SIGNING_KEY="<qstash-next-key>" \
  WORKER_AUTH_SECRET="<mismo-valor-que-en-vercel>"

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

Sin estos archivos, las variantes usan fallbacks: V5 usa el filtro `eq`; V3 conserva el audio original (la música propia de la org no llega al processor: `[TRIAL-REELS-MUSICA]`). Hoy en el repo sólo está `warm.cube`.

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Service role (bypass RLS) |
| `ANTHROPIC_API_KEY` | Sí | Para generación de captions con Haiku |
| `WORKER_AUTH_SECRET` | Sí (prod) | Método principal de auth: header `x-worker-secret`, `Authorization: Bearer` o `?workerSecret=`. Si está, **no** se mira la firma QStash |
| `QSTASH_CURRENT_SIGNING_KEY` | Sí si no hay `WORKER_AUTH_SECRET` | Verificación de firmas QStash (fallback) |
| `QSTASH_NEXT_SIGNING_KEY` | Sí si no hay `WORKER_AUTH_SECRET` | Verificación de firmas QStash (fallback) |
| `PORT` | No | Puerto HTTP (default: 8080) |

## Endpoints

- `GET /health` — Health check (`fly.toml` no define un check que lo use)
- `POST /` — Recibe el job de QStash y lo procesa **sincrónicamente** (la conexión queda abierta hasta terminar, para que Fly no apague la máquina); responde 200 aunque el job falle, para que QStash no reintente

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

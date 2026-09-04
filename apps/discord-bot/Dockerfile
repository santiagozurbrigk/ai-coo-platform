# Imagen del bot de Discord.
#
# El bot es standalone a propósito: no importa ningún paquete del workspace, así
# que la imagen copia sólo su package.json y su src. Eso la hace chica y
# construible sin el monorepo entero.
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install --no-audit --no-fund

COPY src ./src
RUN npm run build

# ─── Imagen final: sólo lo compilado y las dependencias de producción ────────
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=build /app/dist ./dist

# No corre como root: si algo se rompe, que no se rompa con todos los permisos.
USER node

CMD ["node", "dist/index.js"]

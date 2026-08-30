#!/usr/bin/env bash
# Vuelve a bajar y regenerar docs/external-apis/ desde las fuentes públicas.
#
#   ./docs/external-apis/tools/regenerar.sh
#
# Requiere: python3 con beautifulsoup4 + lxml
#   python3 -m pip install beautifulsoup4 lxml
#
# Deja el HTML crudo cacheado en $WORK (por defecto tools/.work), así que
# una segunda corrida no vuelve a pegarle a los servidores.
set -euo pipefail

TOOLS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$TOOLS/.." && pwd)"
export WORK="${WORK:-$TOOLS/.work}"
FECHA="${FECHA:-$(date +%F)}"
mkdir -p "$WORK/raw"

echo "==> 1/5 sitemap de GoHighLevel (para detectar páginas nuevas)"
curl -sSL --max-time 60 "https://marketplace.gohighlevel.com/docs/sitemap.xml" \
  | grep -o '<loc>[^<]*</loc>' | sed 's|<loc>||;s|</loc>||;s|/$||' \
  | grep -vE '/docs/(2021-04-15|2021-07-28|2023-02-21|tags|blog|markdown-page)(/|$)' \
  | sort -u > "$WORK/ghl-urls.new.txt"
if ! diff -q "$TOOLS/ghl-urls.txt" "$WORK/ghl-urls.new.txt" >/dev/null; then
  echo "    el sitemap cambió; se actualiza ghl-urls.txt"
  diff "$TOOLS/ghl-urls.txt" "$WORK/ghl-urls.new.txt" || true
  cp "$WORK/ghl-urls.new.txt" "$TOOLS/ghl-urls.txt"
fi

echo "==> 2/5 descargando páginas de GoHighLevel"
python3 "$TOOLS/fetch.py" "$TOOLS/ghl-urls.txt"

echo "==> 3/5 convirtiendo GoHighLevel a markdown"
rm -rf "$ROOT/gohighlevel/ghl" "$ROOT/gohighlevel/webhook" "$ROOT/gohighlevel/oauth" \
       "$ROOT/gohighlevel/Authorization" "$ROOT/gohighlevel/other" \
       "$ROOT/gohighlevel/marketplace-modules" "$ROOT/gohighlevel/MarketplacePolicies" \
       "$ROOT/gohighlevel/sdk" "$ROOT/gohighlevel/category"
python3 "$TOOLS/build_ghl.py" "$ROOT/gohighlevel" "$FECHA"
python3 "$TOOLS/index_ghl.py" "$ROOT/gohighlevel"

echo "==> 4/5 descargando VTurb (GitBook sirve markdown agregando .md a la URL)"
for p in bem-vindo-a-api-do-analytics-do-vturb autenticacao-da-api analytics release-notes; do
  curl -sSL --max-time 60 "https://vturb.gitbook.io/analytics-api/pt/$p.md" -o "$WORK/raw/vturb-pt-$p.md"
done
for p in "" api-authentication analytics release-notes; do
  curl -sSL --max-time 60 "https://vturb.gitbook.io/analytics-api/$p.md" -o "$WORK/raw/vturb-en-${p:-index}.md"
done
curl -sSL --max-time 60 "https://vturb.gitbook.io/analytics-api/llms.txt" -o "$WORK/raw/vturb-llms.txt"

echo "==> 5/5 reconstruyendo el OpenAPI de VTurb y su referencia"
python3 "$TOOLS/merge_vturb.py" "$WORK/raw/vturb-en-analytics.md" "$WORK/vturb-openapi.json"
python3 "$TOOLS/build_vturb.py" "$ROOT/vturb" "$FECHA"

echo
echo "Listo. Revisar 'git diff' y actualizar la fecha de captura en $ROOT/README.md"

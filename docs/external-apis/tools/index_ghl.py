# -*- coding: utf-8 -*-
import json, os, collections, sys

SCRATCH = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
TOOLS = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
entries = json.load(open(os.path.join(SCRATCH, "ghl-entries.json"), encoding="utf-8"))
by_rel = {e["rel"]: e for e in entries}

def seg(e, i):
    parts = e["rel"][:-3].split("/")
    return parts[i] if len(parts) > i else ""

TOPS = collections.defaultdict(list)
for e in entries:
    TOPS[seg(e, 0)].append(e)

LABEL = {
    "Authorization": "Autorización y tokens",
    "oauth": "OAuth, apps de Marketplace y sandbox",
    "other": "Referencia transversal (rate limits, MCP, países, contexto de usuario)",
    "MarketplacePolicies": "Políticas del Marketplace",
    "sdk": "SDKs oficiales",
    "marketplace-modules": "Módulos del Marketplace (acciones, triggers, páginas, providers)",
    "webhook": "Webhooks",
    "ghl": "API REST v3 por recurso",
    "category": "Índices generados por la doc",
}

def esc(s):
    return s.replace("|", "\\|")

lines = ["# GoHighLevel — índice de la documentación capturada", "",
         "Copia local de `https://marketplace.gohighlevel.com/docs/` (versión **current / v3**).",
         "Cada archivo conserva la URL de origen en su front-matter.", "",
         "- Total de páginas: **%d**" % len(entries),
         "- Endpoints REST documentados: **%d**" % len([e for e in entries if e["method"]]),
         "- Eventos de webhook: **%d**" % len([e for e in entries if seg(e, 0) == "webhook" and seg(e, 1) not in ("WebhookIntegrationGuide", "WebhookLogsDashboard")]),
         "", "> Ver también [`ENDPOINTS.md`](./ENDPOINTS.md) — tabla plana de todos los endpoints ordenada por path.", "",
         "---", ""]

# --- páginas sueltas de raíz
root = sorted([e for e in entries if "/" not in e["rel"][:-3]], key=lambda e: e["rel"])
if root:
    lines += ["## Punto de entrada", ""]
    for e in root:
        lines.append("- [%s](./%s)" % (esc("Documentación (home)" if e["rel"] == "index.md" else e["title"]), e["rel"]))
    lines.append("")

order = ["oauth", "Authorization", "other", "marketplace-modules", "sdk", "MarketplacePolicies", "category"]
for top in order:
    if top not in TOPS:
        continue
    lines += ["## %s" % LABEL.get(top, top), ""]
    for e in sorted(TOPS[top], key=lambda e: e["rel"]):
        crumb = " > ".join(e["crumbs"][:-1])
        lines.append("- [%s](./%s)%s" % (esc(e["title"]), e["rel"],
                                         " — _%s_" % esc(crumb) if crumb else ""))
    lines.append("")

# --- REST
lines += ["---", "", "## %s" % LABEL["ghl"], ""]
res = collections.defaultdict(list)
for e in TOPS.get("ghl", []):
    res[seg(e, 1)].append(e)
for r in sorted(res):
    ops = [e for e in res[r] if e["method"]]
    guides = [e for e in res[r] if not e["method"]]
    lines += ["### `%s` (%d endpoints)" % (r, len(ops)), ""]
    if guides:
        lines.append("Páginas de contexto: " + ", ".join(
            "[%s](./%s)" % (esc(g["title"]), g["rel"]) for g in sorted(guides, key=lambda g: g["rel"])))
        lines.append("")
    if ops:
        lines += ["| Método | Path | Página |", "| --- | --- | --- |"]
        for e in sorted(ops, key=lambda e: (e["path"], e["method"])):
            lines.append("| `%s` | `%s` | [%s](./%s) |" % (e["method"], esc(e["path"]), esc(e["title"]), e["rel"]))
        lines.append("")

# --- webhooks
lines += ["---", "", "## %s" % LABEL["webhook"], ""]
wh = sorted(TOPS.get("webhook", []), key=lambda e: e["rel"])
def first_para(rel):
    path = os.path.join(OUT, rel)
    try:
        txt = open(path, encoding="utf-8").read().split("---\n\n", 1)[-1]
    except OSError:
        return ""
    for block in txt.split("\n\n"):
        b = block.strip()
        if b and not b.startswith(("#", "```", "|", ">", "-", "*")):
            return " ".join(b.split())[:200]
    return ""

lines += ["| Evento | Página | Descripción |", "| --- | --- | --- |"]
for e in wh:
    lines.append("| `%s` | [%s](./%s) | %s |" % (seg(e, 1), esc(e["title"]), e["rel"],
                                                 esc(first_para(e["rel"]))))
lines.append("")

open(os.path.join(OUT, "INDEX.md"), "w", encoding="utf-8").write("\n".join(lines))

# --- ENDPOINTS.md
el = ["# GoHighLevel — todos los endpoints REST", "",
      "Tabla plana de los **%d** endpoints documentados en la versión current (v3), ordenada por path." % len([e for e in entries if e["method"]]), "",
      "Base URL de la API: `https://services.leadconnectorhq.com`", "",
      "| Path | Método | Recurso | Operación | Doc |", "| --- | --- | --- | --- | --- |"]
for e in sorted([e for e in entries if e["method"]], key=lambda e: (e["path"], e["method"])):
    el.append("| `%s` | `%s` | %s | %s | [ver](./%s) |" % (
        esc(e["path"]), e["method"], seg(e, 1), esc(e["title"]), e["rel"]))
open(os.path.join(OUT, "ENDPOINTS.md"), "w", encoding="utf-8").write("\n".join(el) + "\n")
print("index ok")

# -*- coding: utf-8 -*-
"""Commas (ex Fanbasis): commasdocs.com es una SPA de una sola página.

Todas las URLs (`/api/subscribers`, `/api/webhooks`, …) devuelven el mismo HTML y el
router del cliente hace scroll a la sección. Así que se renderiza la home una vez con
Chromium y se parte el DOM ya hidratado en un archivo por `<section id="...">`.
"""
import json
import os
import re
import sys

from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from convert import Renderer, clean, inline  # noqa: E402

SCRATCH = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
CACHE = os.path.join(SCRATCH, "cache-commas")
OUT = sys.argv[1]
FECHA = sys.argv[2]

# Orden y agrupación de las secciones, tomado del sidebar del sitio.
GRUPOS = [
    ("Empezar", ["quick-start", "environments", "merchant-of-record"]),
    ("Conceptos de la API", ["api-basics", "rate-limits", "error-reference"]),
    ("Webhooks", ["webhooks", "webhook-events-reference"]),
    ("Recursos", ["checkout-sessions", "customers", "subscribers", "proration",
                  "discount-codes", "products", "transactions", "refunds", "disputes"]),
    ("SDK de checkout", ["sdk-overview", "sdk-how-it-works", "sdk-quick-start-js",
                         "sdk-quick-start-react", "sdk-session-secret", "sdk-config",
                         "sdk-theme", "sdk-redirects", "sdk-prefill", "sdk-events",
                         "sdk-addons", "sdk-programmatic", "sdk-platforms",
                         "sdk-examples", "sdk-types", "sdk-troubleshooting",
                         "sdk-migration"]),
    ("Herramientas y referencia", ["common-workflows", "api-playground", "sdk-demo",
                                   "ai-agent", "cli", "faq", "support", "changelog"]),
]

URL_BASE = "https://commasdocs.com"
# URLs públicas que el router expone para cada sección (las que pasó el usuario y las
# que salen del sidebar); sólo se usan para el campo `source` del front-matter.
RUTA = {
    "quick-start": "/start-here/quick-start",
    "checkout-sessions": "/api/checkout-sessions",
    "subscribers": "/api/subscribers",
    "webhooks": "/api/webhooks",
    "customers": "/api/customers",
    "discount-codes": "/api/discount-codes",
    "transactions": "/api/transactions",
    "api-playground": "/api/playground",
}


def yaml_str(s):
    return '"%s"' % str(s).replace("\\", "\\\\").replace('"', '\\"')


def guess_lang(text):
    t = text.strip()
    if t.startswith(("{", "[")):
        return "json"
    if t.startswith("curl") or re.match(r"^(npm|yarn|pnpm|bash|export|cd) ", t):
        return "bash"
    if "import " in t or "const " in t or "=>" in t or "function " in t:
        return "js"
    return ""


def render_section(sec):
    r = Renderer()
    for ch in sec.children:
        r.block(ch, 0, 2)
    md = r.text()
    return md


def main():
    files = [f for f in os.listdir(CACHE) if f.endswith(".html")]
    if not files:
        raise SystemExit("no hay HTML renderizado en %s — correr render.py primero" % CACHE)
    html = open(os.path.join(CACHE, sorted(files)[0]), encoding="utf-8").read()
    soup = BeautifulSoup(html, "lxml")

    # El resaltador del sitio produce markup roto (spans anidados con las clases
    # escapadas dentro del texto). El <code> guarda el fuente limpio en
    # `data-template` y el lenguaje en `data-lang`: se usa eso, y sólo si falta se
    # cae al texto plano de los spans.
    for pre in soup.find_all("pre"):
        code = pre.find("code")
        lang = ""
        body = None
        if code is not None:
            if code.get("data-template") is not None:
                body = code["data-template"]
            lang = (code.get("data-lang") or "").strip()
        if body is None:
            body = pre.get_text("", strip=False)
        body = body.rstrip()
        lang = lang or guess_lang(body)
        pre.clear()
        pre.string = body
        if lang:
            pre["class"] = (pre.get("class") or []) + ["language-" + lang]

    secciones = {s.get("id"): s for s in soup.find_all("section", id=True)}
    os.makedirs(OUT, exist_ok=True)
    entries = []
    vistos = set()

    for grupo, ids in GRUPOS:
        for i, sid in enumerate(ids):
            sec = secciones.get(sid)
            if sec is None:
                print("  (falta la sección %s)" % sid)
                continue
            vistos.add(sid)
            md = render_section(sec)
            h = sec.find(["h1", "h2"])
            titulo = clean(inline(h)) if h else sid.replace("-", " ").title()
            url = URL_BASE + RUTA.get(sid, "/#" + sid)
            rel = "%s.md" % sid
            fm = ["---", "title: " + yaml_str(titulo),
                  "source: " + yaml_str(url),
                  "seccion: " + yaml_str(grupo),
                  "ancla: " + yaml_str("#" + sid),
                  "capturado: " + yaml_str(FECHA), "---"]
            open(os.path.join(OUT, rel), "w", encoding="utf-8").write(
                "\n".join(fm) + "\n\n" + md)
            entries.append({"id": sid, "rel": rel, "title": titulo,
                            "grupo": grupo, "url": url, "chars": len(md)})

    # cualquier sección que el sitio agregue y no esté en GRUPOS
    for sid, sec in secciones.items():
        if sid in vistos:
            continue
        md = render_section(sec)
        h = sec.find(["h1", "h2"])
        titulo = clean(inline(h)) if h else sid
        rel = "%s.md" % sid
        fm = ["---", "title: " + yaml_str(titulo),
              "source: " + yaml_str(URL_BASE + "/#" + sid),
              "seccion: " + yaml_str("Sin clasificar"),
              "ancla: " + yaml_str("#" + sid),
              "capturado: " + yaml_str(FECHA), "---"]
        open(os.path.join(OUT, rel), "w", encoding="utf-8").write("\n".join(fm) + "\n\n" + md)
        entries.append({"id": sid, "rel": rel, "title": titulo,
                        "grupo": "Sin clasificar", "url": URL_BASE + "/#" + sid,
                        "chars": len(md)})
        print("  sección nueva sin agrupar:", sid)

    json.dump(entries, open(os.path.join(SCRATCH, "commas-entries.json"), "w", encoding="utf-8"),
              indent=1, ensure_ascii=False)
    print("  secciones escritas:", len(entries))
    return entries


if __name__ == "__main__":
    main()

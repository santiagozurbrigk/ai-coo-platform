# -*- coding: utf-8 -*-
"""Genera los INDEX.md de Whop, Commas, Hyros y WebinarJam desde los *-entries.json
que dejan los build_*.py.
"""
import collections
import json
import os
import sys

SCRATCH = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
ROOT = sys.argv[1]          # docs/external-apis
FECHA = sys.argv[2]


def esc(s):
    return str(s).replace("|", "\\|")


def load(name):
    p = os.path.join(SCRATCH, name)
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else []


def write(path, lines):
    open(path, "w", encoding="utf-8").write("\n".join(lines).rstrip() + "\n")
    print("  ->", os.path.relpath(path, ROOT))


# --------------------------------------------------------------- Whop
def whop():
    entries = load("whop-entries.json")
    if not entries:
        return
    out = os.path.join(ROOT, "whop")
    tops = collections.defaultdict(list)
    for e in entries:
        parts = e["rel"][:-3].split("/")
        tops["/".join(parts[:2]) if len(parts) > 1 else parts[0]].append(e)

    con_endpoint = [e for e in entries if e["endpoints"]]
    lines = [
        "# Whop — índice de la documentación capturada", "",
        "Copia local de `https://docs.whop.com` — %d páginas, capturadas el **%s**." % (len(entries), FECHA), "",
        "La definición de cada endpoint **no** está en su página: Whop publica specs OpenAPI",
        "oficiales y cada página del `api-reference` re-embebe el spec entero. Acá los specs",
        "se guardan una sola vez y la referencia legible se genera desde ellos.", "",
        "| Archivo | Qué es |", "| --- | --- |",
        "| [`RESUMEN-OTC.md`](./RESUMEN-OTC.md) | **Empezar por acá** — lo que OTC necesita de Whop, con las preguntas de `API_DOCS_PENDIENTES.md` §1 respondidas |",
        "| [`ENDPOINTS-api-v1-native.md`](./ENDPOINTS-api-v1-native.md) | Referencia de la API versionada (la de integraciones nuevas) |",
        "| [`ENDPOINTS-api-v1-stable.md`](./ENDPOINTS-api-v1-stable.md) | Referencia de los recursos legacy |",
        "| [`ENDPOINTS-ledger-stats.md`](./ENDPOINTS-ledger-stats.md) | Wallet Stats API |",
        "| [`openapi/`](./openapi/) | Los specs oficiales, tal como los sirve Whop |",
        "", "---", "", "## Páginas por sección", "",
        "- Páginas totales: **%d**" % len(entries),
        "- Páginas que documentan un endpoint concreto: **%d**" % len(con_endpoint), "",
    ]
    for top in sorted(tops):
        items = sorted(tops[top], key=lambda e: e["rel"])
        lines += ["### `%s` (%d)" % (top, len(items)), ""]
        for e in items:
            ep = ""
            if e["endpoints"]:
                ep = " — `%s %s`" % (e["endpoints"][0][0], e["endpoints"][0][1])
            elif e["desc"]:
                ep = " — %s" % esc(e["desc"][:150])
            lines.append("- [%s](./%s)%s" % (esc(e["title"]), e["rel"], ep))
        lines.append("")
    write(os.path.join(out, "INDEX.md"), lines)


# ------------------------------------------------------------- Commas
def commas():
    entries = load("commas-entries.json")
    if not entries:
        return
    out = os.path.join(ROOT, "commas")
    grupos = collections.OrderedDict()
    for e in entries:
        grupos.setdefault(e["grupo"], []).append(e)
    lines = [
        "# Commas (ex Fanbasis) — índice de la documentación capturada", "",
        "Copia local de `https://commasdocs.com`, capturada el **%s**." % FECHA, "",
        "> **Fanbasis se llama Commas.** El dominio viejo `apidocs.fan` ya no es la",
        "> documentación vigente; la de acá es la que publica Commas hoy.", "",
        "commasdocs.com es una SPA de **una sola página**: todas las URLs (`/api/subscribers`,",
        "`/api/webhooks`, …) devuelven el mismo HTML y el router hace scroll a la sección.",
        "Por eso la copia se guarda como un archivo por sección, con la URL pública de cada una",
        "en su front-matter.", "",
        "| Archivo | Qué es |", "| --- | --- |",
        "| [`RESUMEN-OTC.md`](./RESUMEN-OTC.md) | **Empezar por acá** — lo que OTC necesita, con las preguntas de `API_DOCS_PENDIENTES.md` §2 respondidas |",
        "", "---", "",
    ]
    for grupo, items in grupos.items():
        lines += ["## %s" % grupo, ""]
        for e in items:
            lines.append("- [%s](./%s) — `%s`" % (esc(e["title"]), e["rel"], e["url"]))
        lines.append("")
    write(os.path.join(out, "INDEX.md"), lines)


# -------------------------------------------------------------- Hyros
def hyros():
    entries = load("hyros-entries.json")
    if not entries:
        return
    out = os.path.join(ROOT, "hyros")
    grupos = collections.defaultdict(list)
    for e in entries:
        grupos[e["crumbs"][0] if e["crumbs"] else "—"].append(e)
    lines = [
        "# Hyros — índice de la documentación capturada", "",
        "Capturada el **%s**. Son dos fuentes distintas, y conviene no confundirlas:" % FECHA, "",
        "| Archivo | Qué es | Fuente |", "| --- | --- | --- |",
        "| [`RESUMEN-OTC.md`](./RESUMEN-OTC.md) | **Empezar por acá** — lo que OTC necesita para I-8, con las preguntas de `API_DOCS_PENDIENTES.md` §6 respondidas | — |",
        "| [`ENDPOINTS-rest-api.md`](./ENDPOINTS-rest-api.md) | **La referencia de la API.** Leads, journeys, ventas, órdenes, llamadas, atribución | `api-docs.hyros.com/ai-context/rest-api.txt` (OpenAPI 3.1) |",
        "| [`ENDPOINTS-webhooks.md`](./ENDPOINTS-webhooks.md) | Los 10 eventos salientes, con su esquema de firma HMAC | `.../webhooks.txt` |",
        "| [`ENDPOINTS-mcp.md`](./ENDPOINTS-mcp.md) | El servidor MCP de Hyros | `.../mcp.txt` |",
        "| [`openapi/`](./openapi/) | Los tres specs, tal como los sirve Hyros | idem |",
        "| [`apiary-blueprint.md`](./apiary-blueprint.md) | El documento viejo de Apiary (v1.37), en API Blueprint. Prosa y ejemplos que el spec no repite | `hyros.docs.apiary.io` |",
        "| [`docs/`](./docs/) | Las **%d guías** de docs.hyros.com: setup, embudos, integraciones | `docs.hyros.com` (renderizado) |" % len(entries),
        "", "---", "", "## Guías por sección", "",
    ]
    for grupo in sorted(grupos):
        items = sorted(grupos[grupo], key=lambda e: e["rel"])
        lines += ["### %s (%d)" % (grupo, len(items)), ""]
        for e in items:
            sub = " > ".join(e["crumbs"][1:-1]) if len(e["crumbs"]) > 2 else ""
            lines.append("- [%s](./%s)%s" % (esc(e["title"]), e["rel"],
                                             " — _%s_" % esc(sub) if sub else ""))
        lines.append("")
    write(os.path.join(out, "INDEX.md"), lines)


# --------------------------------------------------------- WebinarJam
def webinarjam():
    entries = load("wj-entries.json")
    if not entries:
        return
    out = os.path.join(ROOT, "webinarjam")
    grupos = collections.OrderedDict()
    for e in entries:
        grupos.setdefault(e["grupo"], []).append(e)
    lines = [
        "# WebinarJam / EverWebinar — índice de la documentación capturada", "",
        "Copia local de los %d artículos de API del centro de ayuda, capturados el **%s**." % (len(entries), FECHA), "",
        "Las dos APIs son **la misma API con dos prefijos**: `/webinarjam/*` para webinars en",
        "vivo y `/everwebinar/*` para automatizados. Los endpoints y los payloads son idénticos",
        "salvo por el prefijo, así que las páginas de EverWebinar repiten las de WebinarJam.", "",
        "| Archivo | Qué es |", "| --- | --- |",
        "| [`RESUMEN-OTC.md`](./RESUMEN-OTC.md) | **Empezar por acá** — lo que OTC necesita para I-5, con las preguntas de `API_DOCS_PENDIENTES.md` §5 respondidas |",
        "", "---", "",
    ]
    for grupo, items in grupos.items():
        lines += ["## %s" % grupo, ""]
        for e in items:
            lines.append("- [%s](./%s)" % (esc(e["title"]), e["rel"]))
        lines.append("")
    write(os.path.join(out, "INDEX.md"), lines)


if __name__ == "__main__":
    whop()
    commas()
    hyros()
    webinarjam()

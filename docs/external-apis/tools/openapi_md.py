# -*- coding: utf-8 -*-
"""OpenAPI 3.x -> Markdown legible.

Se usa para los proveedores que publican un spec (VTurb, Whop, Hyros). Genera una
referencia navegable sin inventar nada: lo que el spec no dice, no aparece.
"""
import json
import re

MAX_DEPTH = 7


def _slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def anchor(method, path):
    return _slug("%s %s" % (method, path))


def _one(text):
    return " ".join(str(text or "").split())


class SpecRenderer:
    def __init__(self, spec):
        self.spec = spec
        self.schemas = (spec.get("components") or {}).get("schemas") or {}

    # ---------- resolución de $ref -------------------------------------
    def _resolve_pointer(self, ref):
        """#/components/<seccion>/<nombre> -> el nodo. Sólo refs internas."""
        if not ref.startswith("#/"):
            return {}
        node = self.spec
        for part in ref[2:].split("/"):
            part = part.replace("~1", "/").replace("~0", "~")
            if not isinstance(node, dict) or part not in node:
                return {}
            node = node[part]
        return node if isinstance(node, dict) else {}

    def deref(self, node, seen=()):
        while isinstance(node, dict) and "$ref" in node:
            ref = node["$ref"]
            if ref in seen:
                name = ref.rsplit("/", 1)[-1]
                return {"type": "object", "description": "(referencia recursiva a %s)" % name}, seen
            node = self._resolve_pointer(ref)
            seen = seen + (ref,)
        return node or {}, seen

    def type_label(self, node):
        """Etiqueta de tipo legible, sin resolver el $ref (para no perder el nombre)."""
        if not isinstance(node, dict):
            return "any"
        if "$ref" in node:
            return node["$ref"].rsplit("/", 1)[-1]
        t = node.get("type")
        if isinstance(t, list):
            t = " | ".join(t)
        if t == "array":
            return "%s[]" % self.type_label(node.get("items") or {})
        for kw in ("oneOf", "anyOf", "allOf"):
            if node.get(kw):
                inner = " | ".join(self.type_label(s) for s in node[kw][:4])
                return inner if kw != "allOf" else (inner or "object")
        if node.get("enum"):
            return t or "enum"
        return t or "object"

    # ---------- render de un schema como lista anidada -------------------
    def schema_lines(self, node, indent=0, depth=0, seen=(), out=None):
        out = [] if out is None else out
        pad = "  " * indent
        if depth > MAX_DEPTH:
            out.append(pad + "- _(anidamiento truncado)_")
            return out
        node, seen = self.deref(node, seen)
        if not isinstance(node, dict):
            return out

        for kw, label in (("oneOf", "uno de"), ("anyOf", "cualquiera de")):
            if node.get(kw):
                out.append(pad + "- _%s:_" % label)
                for sub in node[kw]:
                    out.append(pad + "  - **%s**" % self.type_label(sub))
                    self.schema_lines(sub, indent + 2, depth + 1, seen, out)
                return out
        if node.get("allOf"):
            for sub in node["allOf"]:
                self.schema_lines(sub, indent, depth + 1, seen, out)
            return out

        t = node.get("type")
        if t == "array" or node.get("items"):
            out.append(pad + "- `array` de:")
            return self.schema_lines(node.get("items") or {}, indent + 1, depth + 1, seen, out)

        props = node.get("properties") or {}
        required = set(node.get("required") or [])
        if not props:
            desc = _one(node.get("description"))
            if desc:
                out.append(pad + "- " + desc)
            elif node.get("additionalProperties"):
                out.append(pad + "- `object` de claves libres")
            return out

        for name, prop in props.items():
            bits = ["- **%s** `%s`" % (name, self.type_label(prop))]
            if name in required:
                bits.append("_requerido_")
            line = pad + " ".join(bits)
            resolved, _ = self.deref(prop, seen)
            desc = _one(prop.get("description") or resolved.get("description"))
            if desc:
                line += " — " + desc
            enum = prop.get("enum") or resolved.get("enum")
            if enum:
                vals = ", ".join("`%s`" % v for v in enum[:24])
                line += " · valores: " + vals + (" …" if len(enum) > 24 else "")
            fmt = prop.get("format") or resolved.get("format")
            if fmt:
                line += " · formato: `%s`" % fmt
            if prop.get("default") is not None:
                line += " · default: `%s`" % prop["default"]
            out.append(line)
            nxt, _ = self.deref(prop, seen)
            if nxt.get("properties") or nxt.get("items") or nxt.get("oneOf") \
                    or nxt.get("anyOf") or nxt.get("allOf"):
                self.schema_lines(prop, indent + 1, depth + 1, seen, out)
        return out

    # ---------- render de una operación ---------------------------------
    def operation(self, path, method, op, level=2):
        h = "#" * level
        out = ["%s `%s %s`" % (h, method.upper(), path), ""]
        if op.get("deprecated"):
            out += ["> ⚠️ **Deprecado.**", ""]
        if op.get("summary"):
            out += ["**%s**" % _one(op["summary"]), ""]
        if op.get("description"):
            out += [_one(op["description"]), ""]
        meta = []
        if op.get("operationId"):
            meta.append("`operationId`: `%s`" % op["operationId"])
        if op.get("tags"):
            meta.append("tags: " + ", ".join("`%s`" % t for t in op["tags"]))
        if op.get("security") is not None:
            names = sorted({k for s in op["security"] for k in s})
            meta.append("seguridad: " + (", ".join("`%s`" % n for n in names) or "_ninguna_"))
        if meta:
            out += [" · ".join(meta), ""]

        params = op.get("parameters") or []
        if params:
            out += ["%s# Parámetros" % h, ""]
            for p in params:
                p, _ = self.deref(p)
                sch = p.get("schema") or {}
                line = "- **%s** (`%s`) `%s`" % (p.get("name"), p.get("in"), self.type_label(sch))
                if p.get("required"):
                    line += " _requerido_"
                if p.get("description"):
                    line += " — " + _one(p["description"])
                if sch.get("enum"):
                    line += " · valores: " + ", ".join("`%s`" % v for v in sch["enum"][:24])
                if sch.get("default") is not None:
                    line += " · default: `%s`" % sch["default"]
                out.append(line)
            out.append("")

        body = op.get("requestBody")
        if body:
            body, _ = self.deref(body)
            for mime, media in (body.get("content") or {}).items():
                req = " (requerido)" if body.get("required") else ""
                out += ["%s# Request body — `%s`%s" % (h, mime, req), ""]
                if media.get("schema"):
                    out += self.schema_lines(media["schema"])
                    out.append("")
                ex = self._example(media)
                if ex:
                    out += ["```json", ex, "```", ""]

        responses = op.get("responses") or {}
        if responses:
            out += ["%s# Respuestas" % h, ""]
            for code, resp in responses.items():
                resp, _ = self.deref(resp)
                out += ["**`%s`** — %s" % (code, _one(resp.get("description")) or "—"), ""]
                for mime, media in (resp.get("content") or {}).items():
                    if media.get("schema"):
                        out += self.schema_lines(media["schema"])
                        out.append("")
                    ex = self._example(media)
                    if ex:
                        out += ["```json", ex, "```", ""]
        return out

    @staticmethod
    def _example(media):
        ex = media.get("example")
        if ex is None:
            examples = media.get("examples") or {}
            for v in examples.values():
                v, _ = (v, None)
                if isinstance(v, dict) and "value" in v:
                    ex = v["value"]
                    break
        if ex is None:
            return None
        try:
            text = json.dumps(ex, indent=2, ensure_ascii=False)
        except (TypeError, ValueError):
            return None
        return text if len(text) < 6000 else None


def operations(spec):
    """[(path, METHOD, op)] ordenado por path."""
    verbs = ("get", "post", "put", "patch", "delete", "head", "options")
    out = []
    for path, item in (spec.get("paths") or {}).items():
        if not isinstance(item, dict):
            continue
        shared = item.get("parameters") or []
        for method, op in item.items():
            if method.lower() not in verbs or not isinstance(op, dict):
                continue
            if shared:
                op = dict(op)
                op["parameters"] = shared + (op.get("parameters") or [])
            out.append((path, method.upper(), op))
    out.sort(key=lambda x: (x[0], x[1]))
    return out


def webhook_operations(spec):
    """OpenAPI 3.1 expone los eventos salientes bajo `webhooks:`, no bajo `paths:`."""
    verbs = ("get", "post", "put", "patch", "delete")
    out = []
    for event, item in (spec.get("webhooks") or {}).items():
        if not isinstance(item, dict):
            continue
        for method, op in item.items():
            if method.lower() in verbs and isinstance(op, dict):
                out.append((event, method.upper(), op))
    out.sort(key=lambda x: x[0])
    return out


def render_spec(spec, titulo, front_matter=None, intro=None, spec_link=None):
    """Documento markdown completo: front-matter, índice y una sección por operación."""
    r = SpecRenderer(spec)
    ops = operations(spec)
    info = spec.get("info") or {}
    lines = []
    if front_matter:
        lines += ["---"] + ["%s: %s" % (k, json.dumps(v, ensure_ascii=False))
                            for k, v in front_matter.items()] + ["---", ""]
    lines += ["# %s" % titulo, ""]
    if intro:
        lines += [intro, ""]
    meta = []
    if info.get("version"):
        meta.append("- Versión declarada: `%s`" % info["version"])
    if info.get("x-api-version-date"):
        meta.append("- `x-api-version-date`: `%s`" % info["x-api-version-date"])
    for s in (spec.get("servers") or [])[:4]:
        meta.append("- Server: `%s`%s" % (s.get("url"),
                                          " — %s" % _one(s.get("description")) if s.get("description") else ""))
    sec = (spec.get("components") or {}).get("securitySchemes") or {}
    for name, s in sec.items():
        s, _ = r.deref(s)
        det = s.get("type", "")
        if s.get("scheme"):
            det += " / %s" % s["scheme"]
        if s.get("in") and s.get("name"):
            det += " / %s `%s`" % (s["in"], s["name"])
        meta.append("- Auth `%s`: %s%s" % (name, det,
                                           " — %s" % _one(s.get("description")) if s.get("description") else ""))
    if spec_link:
        meta.append("- Spec original: [`%s`](%s)" % (spec_link, spec_link))
    if meta:
        lines += meta + [""]
    if _one(info.get("description")):
        lines += ["## Descripción del proveedor", "", info["description"].strip(), ""]

    tags = spec.get("tags") or []
    if tags:
        lines += ["## Secciones del spec", ""]
        for t in tags:
            if not isinstance(t, dict):
                continue
            lines += ["### %s" % t.get("name", "—"), ""]
            if t.get("description"):
                lines += [t["description"].strip(), ""]

    hooks = webhook_operations(spec)
    if hooks:
        lines += ["## Eventos de webhook", "", "| Evento | Método | Qué lo dispara |",
                  "| --- | --- | --- |"]
        for event, method, op in hooks:
            lines.append("| `%s` | `%s` | %s |" % (
                event, method, _one(op.get("summary") or op.get("description") or "").replace("|", "\\|")))
        lines.append("")
        for event, method, op in hooks:
            lines += ["---", ""] + r.operation(event, method, op, level=2)

    if not ops:
        return "\n".join(lines).rstrip() + "\n"

    lines += ["## Índice de endpoints", "", "| Método | Path | Qué hace |", "| --- | --- | --- |"]
    for path, method, op in ops:
        lines.append("| `%s` | [`%s`](#%s) | %s |" % (
            method, path.replace("|", "\\|"), anchor(method, path),
            _one(op.get("summary") or op.get("operationId") or "").replace("|", "\\|")))
    lines.append("")

    for path, method, op in ops:
        lines += ["---", ""] + r.operation(path, method, op, level=2)
    return "\n".join(lines).rstrip() + "\n"

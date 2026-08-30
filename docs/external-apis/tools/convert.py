# -*- coding: utf-8 -*-
"""HTML (Docusaurus + docusaurus-plugin-openapi-docs) -> Markdown."""
import re, sys
from bs4 import BeautifulSoup, NavigableString, Tag

SKIP_CLASSES = {
    "theme-doc-breadcrumbs", "breadcrumbsContainer_Z_bl", "openapi__divider",
    "openapi-skeleton", "hash-link", "buttonGroup_M5ko", "copyButtonIcons_IEyt",
    "copyButtonIcon_TrPX", "copyButtonSuccessIcon_cVMy", "hr-pgroup__caret",
    "hr-dd__chevron", "theme-doc-version-badge", "openapi-tabs__mime-container",
    "openapi-tabs__schema-tabs-container", "pagination-nav", "theme-doc-toc-mobile",
    "theme-doc-footer", "tocCollapsible_ETCw",
    "openapi-right-panel__container", "theme-doc-version-banner", "clean-btn",
}
SKIP_TAGS = {"svg", "script", "style", "button", "nav", "footer"}


def cls(el):
    return set(el.get("class") or [])


def inline(node):
    """Render inline content to markdown text."""
    if isinstance(node, NavigableString):
        return re.sub(r"\s+", " ", str(node))
    if not isinstance(node, Tag):
        return ""
    if node.name in SKIP_TAGS or cls(node) & SKIP_CLASSES:
        return ""
    if node.name == "code":
        t = node.get_text(" ", strip=True)
        return "`%s`" % t if t else ""
    if node.name in ("strong", "b"):
        t = "".join(inline(c) for c in node.children).strip()
        return "**%s**" % t if t else ""
    if node.name in ("em", "i"):
        t = "".join(inline(c) for c in node.children).strip()
        return "_%s_" % t if t else ""
    if node.name == "a":
        t = "".join(inline(c) for c in node.children).strip()
        href = node.get("href", "")
        if not t:
            return ""
        if href.startswith("/"):
            href = "https://marketplace.gohighlevel.com" + href
        return "[%s](%s)" % (t, href) if href else t
    if node.name == "img":
        src = node.get("src", "")
        if src.startswith("/"):
            src = "https://marketplace.gohighlevel.com" + src
        return "![%s](%s)" % (node.get("alt", ""), src)
    if node.name == "br":
        return "\n"
    return "".join(inline(c) for c in node.children)


def clean(text):
    return re.sub(r"[ \t]+", " ", text).strip()


def code_block(pre):
    """Reassemble a prism code block."""
    lang = ""
    for anc in [pre] + list(pre.parents)[:3]:
        if not isinstance(anc, Tag):
            continue
        for c in cls(anc):
            if c.startswith("language-"):
                lang = c[len("language-"):]
                break
        if lang:
            break
    lines = pre.select("div.token-line")
    if lines:
        body = "\n".join(l.get_text("", strip=False) for l in lines)
    else:
        body = pre.get_text("", strip=False)
    body = body.rstrip()
    return "```%s\n%s\n```" % (lang, body)


def schema_container(span):
    """span.openapi-schema__container -> '**name** `type` — required'."""
    prop = span.select_one(".openapi-schema__property")
    typ = span.select_one(".openapi-schema__type") or span.select_one(".openapi-schema__name")
    req = span.select_one(".openapi-schema__required")
    name = prop.get_text(" ", strip=True) if prop else span.get_text(" ", strip=True)
    parts = ["**%s**" % name]
    if typ:
        t = typ.get_text(" ", strip=True)
        if t:
            parts.append("`%s`" % t)
    if req:
        parts.append("_%s_" % req.get_text(" ", strip=True))
    return " ".join(parts)


class Renderer:
    def __init__(self, base_heading=1):
        self.out = []
        self.h = base_heading

    def emit(self, text=""):
        self.out.append(text)

    def block(self, node, indent=0, hlevel=3):
        pad = "  " * indent
        if isinstance(node, NavigableString):
            t = clean(str(node))
            if t:
                self.emit(pad + t)
            return
        if not isinstance(node, Tag):
            return
        if node.name in SKIP_TAGS or cls(node) & SKIP_CLASSES:
            return
        c = cls(node)
        name = node.name

        # --- OpenAPI specifics -------------------------------------------
        if "openapi__method-endpoint" in c:
            method = node.select_one(".badge")
            path = node.select_one(".openapi__method-endpoint-path")
            self.emit("```http\n%s %s\n```" % (
                method.get_text(strip=True) if method else "",
                path.get_text(strip=True) if path else ""))
            return
        if "hr-pgroup" in c:
            title = node.select_one(".hr-pgroup__title")
            meta = []
            for m in node.select(".hr-dd__value, .hr-pgroup__hint"):
                t = m.get_text(" ", strip=True)
                if t:
                    meta.append(t)
            head = title.get_text(" ", strip=True) if title else "Parameters"
            if meta:
                head += " (%s)" % " · ".join(dict.fromkeys(meta))
            self.emit("%s %s" % ("#" * hlevel, head))
            rows = node.select_one(".hr-pgroup__rows")
            if rows:
                for ch in rows.children:
                    self.block(ch, indent, hlevel + 1)
            return
        if "openapi-params__list-item" in c or "openapi-schema__list-item" in c:
            sc = node.select_one(".openapi-schema__container")
            lead = schema_container(sc) if sc else ""
            desc_parts = []
            for p in node.find_all("p", recursive=False):
                t = clean(inline(p))
                if t:
                    desc_parts.append(t)
            line = pad + "- " + lead
            if desc_parts:
                line += " — " + " ".join(desc_parts)
            self.emit(line)
            for enum in node.find_all("div", class_="hr-enum", recursive=False):
                label = enum.select_one(".hr-enum__label")
                vals = [v.get_text(" ", strip=True) for v in enum.select(".hr-enum__value")]
                if vals:
                    self.emit(pad + "  - %s: %s" % (
                        label.get_text(" ", strip=True) if label else "Available options",
                        ", ".join("`%s`" % v for v in vals)))
            for ch in node.children:
                if isinstance(ch, Tag) and ch.name in ("ul", "ol", "div", "details") \
                        and "hr-enum" not in cls(ch) and "openapi-schema__container" not in cls(ch):
                    self.block(ch, indent + 1, hlevel)
            return
        if name == "a" and "theme-doc-card-container" in c:
            t = node.select_one(".theme-doc-card-title") or node.select_one("h2")
            d = node.select_one(".theme-doc-card-description")
            title = clean(t.get_text(" ", strip=True)) if t else clean(node.get_text(" ", strip=True))
            desc = clean(d.get_text(" ", strip=True)) if d else ""
            href = node.get("href", "")
            if href.startswith("/"):
                href = "https://marketplace.gohighlevel.com" + href
            line = pad + "- [%s](%s)" % (title, href)
            if desc and desc != title:
                line += " — " + desc
            self.emit(line)
            return
        if name == "details":
            summ = node.find("summary")
            label = clean(summ.get_text(" ", strip=True)) if summ else ""
            if label:
                self.emit(pad + "**%s**" % label)
            for ch in node.children:
                if ch is summ:
                    continue
                self.block(ch, indent, hlevel)
            return
        if "hr-response__description" in c:
            t = clean(inline(node))
            if t:
                self.emit(pad + t)
            return
        if "openapi-tabs__schema-container" in c:
            for ch in node.children:
                self.block(ch, indent, hlevel)
            return
        if "openapi-schema__container" in c:
            self.emit(pad + "- " + schema_container(node))
            return

        # --- Generic ------------------------------------------------------
        if name in ("h1", "h2", "h3", "h4", "h5", "h6"):
            t = clean(inline(node))
            if t:
                self.emit("%s %s" % ("#" * int(name[1]), t))
            return
        if name == "pre":
            self.emit(code_block(node))
            return
        if name == "table":
            self.table(node)
            return
        if name in ("ul", "ol"):
            items = node.find_all("li", recursive=False)
            if not items:
                for ch in node.children:
                    self.block(ch, indent, hlevel)
                return
            try:
                start = int(node.get("start", 1))
            except (TypeError, ValueError):
                start = 1
            for i, li in enumerate(items, start):
                marker = "- " if name == "ul" else "%d. " % i
                blocks = [ch for ch in li.children
                          if isinstance(ch, Tag) and ch.name in ("ul", "ol", "pre", "table", "div", "details")]
                head = clean("".join(inline(ch) for ch in li.children
                                     if not (isinstance(ch, Tag) and ch in blocks)))
                if head:
                    self.emit(pad + marker + head)
                for b in blocks:
                    self.block(b, indent + 1, hlevel)
            return
        if name == "blockquote":
            t = clean(inline(node))
            if t:
                self.emit("> " + t)
            return
        if name == "p":
            t = clean(inline(node))
            if t:
                self.emit(pad + t)
            return
        if name == "hr":
            self.emit("---")
            return
        if name in ("span", "code", "strong", "em", "a", "summary", "label"):
            t = clean(inline(node))
            if t:
                self.emit(pad + t)
            return
        # containers
        if "theme-admonition" in c or "alert" in c:
            t = []
            sub = Renderer()
            for ch in node.children:
                sub.block(ch, 0, hlevel)
            body = sub.text()
            if body.strip():
                self.emit("\n".join("> " + l if l else ">" for l in body.split("\n")))
            return
        for ch in node.children:
            self.block(ch, indent, hlevel)

    def table(self, node):
        rows = []
        for tr in node.find_all("tr"):
            cells = [clean(inline(td)).replace("|", "\\|") for td in tr.find_all(["th", "td"])]
            if cells:
                rows.append(cells)
        if not rows:
            return
        width = max(len(r) for r in rows)
        rows = [r + [""] * (width - len(r)) for r in rows]
        lines = ["| " + " | ".join(rows[0]) + " |",
                 "| " + " | ".join(["---"] * width) + " |"]
        for r in rows[1:]:
            lines.append("| " + " | ".join(r) + " |")
        self.emit("\n".join(lines))

    def text(self):
        out = "\n\n".join(x for x in self.out if x is not None and x != "")
        out = re.sub(r"\n{3,}", "\n\n", out)
        # collapse blank lines between consecutive bullet lines
        lines = out.split("\n")
        res = []
        for i, l in enumerate(lines):
            if l == "" and res and re.match(r"^\s*[-*] ", res[-1]) and i + 1 < len(lines) \
                    and re.match(r"^\s*[-*] ", lines[i + 1]):
                continue
            res.append(l)
        return "\n".join(res).strip() + "\n"


def absolutize(md, url):
    """Los links relativos de la fuente apuntan a rutas de Docusaurus (sin .md).
    Se reescriben como URLs absolutas para que no queden rotos en la copia local."""
    from urllib.parse import urljoin

    def repl(m):
        return "](%s)" % urljoin(url + "/", m.group(1))
    return re.sub(r"\]\((\.\.?/[^)]*)\)", repl, md)


def convert(html, url):
    soup = BeautifulSoup(html, "lxml")
    art = soup.find("article") or soup.find("main")
    if art is None:
        return None, None
    crumbs = [c.get_text(" ", strip=True)
              for c in art.select("nav.theme-doc-breadcrumbs .breadcrumbs__link")]
    crumbs = [c for c in crumbs if c]
    badge = art.select_one(".theme-doc-version-badge")
    version = badge.get_text(" ", strip=True).replace("Version:", "").strip() if badge else ""
    body = art.select_one(".theme-doc-markdown") or art
    r = Renderer()
    for ch in body.children:
        r.block(ch, 0, 3)
    md = absolutize(r.text(), url)
    h1 = art.find("h1")
    title = clean(inline(h1)) if h1 else (crumbs[-1] if crumbs else url.rsplit("/", 1)[-1])
    meta = {"title": title, "breadcrumbs": crumbs, "version": version, "url": url}
    return meta, md


if __name__ == "__main__":
    html = open(sys.argv[1], encoding="utf-8").read()
    meta, md = convert(html, sys.argv[2] if len(sys.argv) > 2 else "")
    print(meta)
    print(md)

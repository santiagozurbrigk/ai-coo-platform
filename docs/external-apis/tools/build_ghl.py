# -*- coding: utf-8 -*-
import os, re, json, datetime
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from convert import convert

SCRATCH = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
TOOLS = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(SCRATCH, "cache")
OUT = sys.argv[1]
FETCHED = sys.argv[2]

urls = [l.strip() for l in open(os.path.join(TOOLS, "ghl-urls.txt")) if l.strip()]

def cache_path(u):
    return os.path.join(CACHE, u.split("://", 1)[1].replace("/", "__") + ".html")

def rel_for(u):
    rel = u.split("/docs", 1)[1].strip("/")
    if not rel:
        rel = "index"
    return rel + ".md"

def yaml_str(s):
    return '"%s"' % str(s).replace('\\', '\\\\').replace('"', '\\"')

entries = []
for u in urls:
    p = cache_path(u)
    if not os.path.exists(p):
        print("MISSING", u); continue
    meta, md = convert(open(p, encoding="utf-8").read(), u)
    if meta is None:
        print("NO ARTICLE", u); continue
    rel = rel_for(u)
    dest = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    m = re.search(r"```http\n([A-Z]+) (\S*)\n```", md)
    method, path = (m.group(1), m.group(2)) if m else ("", "")
    fm = ["---",
          "title: " + yaml_str(meta["title"]),
          "source: " + yaml_str(u),
          "seccion: " + yaml_str(" > ".join(meta["breadcrumbs"]) or rel),
          "api_version: " + yaml_str(meta["version"] or "-"),
          "capturado: " + yaml_str(FETCHED)]
    if method:
        fm.append("metodo: " + yaml_str(method))
        fm.append("path: " + yaml_str(path))
    fm.append("---")
    open(dest, "w", encoding="utf-8").write("\n".join(fm) + "\n\n" + md)
    entries.append({"url": u, "rel": rel, "title": meta["title"],
                    "crumbs": meta["breadcrumbs"], "method": method, "path": path,
                    "version": meta["version"]})

json.dump(entries, open(os.path.join(SCRATCH, "ghl-entries.json"), "w", encoding="utf-8"),
          indent=1, ensure_ascii=False)
print("escritos", len(entries))

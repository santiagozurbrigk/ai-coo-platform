import json, re, sys, collections
src = open(sys.argv[1], encoding="utf-8").read()
blocks = re.findall(r"```json\n(\{.*?\})\n```", src, re.S)
merged = None
paths = {}
schemas = {}
sec = {}
dupes = []
for b in blocks:
    d = json.loads(b)
    if merged is None:
        merged = {"openapi": d["openapi"], "info": dict(d["info"]),
                  "servers": d.get("servers", []), "tags": d.get("tags", []),
                  "security": d.get("security", [])}
    comps = d.get("components", {})
    for k, v in comps.get("schemas", {}).items():
        if k in schemas and schemas[k] != v:
            dupes.append(("schema", k))
        schemas[k] = v
    for k, v in comps.get("securitySchemes", {}).items():
        sec[k] = v
    for p, ops in d.get("paths", {}).items():
        if p in paths:
            paths[p].update(ops)
        else:
            paths[p] = ops
merged["paths"] = dict(sorted(paths.items()))
merged["components"] = {"securitySchemes": sec, "schemas": dict(sorted(schemas.items()))}
json.dump(merged, open(sys.argv[2], "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print("blocks", len(blocks), "paths", len(paths), "schemas", len(schemas), "conflictos", dupes)

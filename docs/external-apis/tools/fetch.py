import os, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

BASE = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
os.makedirs(BASE, exist_ok=True)
CACHE = os.path.join(BASE, "cache")
urls = [l.strip() for l in open(sys.argv[1]) if l.strip()]

def path_for(u):
    rel = u.split("://",1)[1]
    return os.path.join(CACHE, rel.replace("/", "__") + ".html")

def get(u):
    p = path_for(u)
    if os.path.exists(p) and os.path.getsize(p) > 2000:
        return "cached", u
    for attempt in range(4):
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (docs-archiver)"})
            with urllib.request.urlopen(req, timeout=45) as r:
                data = r.read()
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, "wb") as f:
                f.write(data)
            return "ok", u
        except Exception as e:
            if attempt == 3:
                return "FAIL %s" % e, u
            time.sleep(2 ** attempt)

os.makedirs(CACHE, exist_ok=True)
fails = []
done = 0
with ThreadPoolExecutor(max_workers=8) as ex:
    for status, u in ex.map(get, urls):
        done += 1
        if status.startswith("FAIL"):
            fails.append((u, status))
        if done % 100 == 0:
            print("...", done, flush=True)
print("total", done, "fails", len(fails))
for u, s in fails[:20]:
    print(s, u)

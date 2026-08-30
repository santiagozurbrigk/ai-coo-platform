import os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
BASE = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
os.makedirs(BASE, exist_ok=True)
CACHE = os.path.join(BASE, sys.argv[2])
os.makedirs(CACHE, exist_ok=True)
urls = [l.strip() for l in open(sys.argv[1]) if l.strip()]
def path_for(u):
    return os.path.join(CACHE, u.split("://",1)[1].replace("/", "__"))
def get(u):
    p = path_for(u)
    if os.path.exists(p) and os.path.getsize(p) > 50:
        return "cached", u
    for a in range(4):
        try:
            req = urllib.request.Request(u, headers={"User-Agent":"Mozilla/5.0 (docs-archiver)"})
            with urllib.request.urlopen(req, timeout=45) as r:
                d = r.read()
            open(p,"wb").write(d)
            return "ok", u
        except Exception as e:
            if a == 3: return "FAIL %s" % e, u
            time.sleep(2**a)
fails=[]; done=0
with ThreadPoolExecutor(max_workers=8) as ex:
    for st,u in ex.map(get, urls):
        done+=1
        if st.startswith("FAIL"): fails.append((u,st))
        if done%150==0: print("...",done,flush=True)
print("total",done,"fails",len(fails))
for u,s in fails[:15]: print(s,u)

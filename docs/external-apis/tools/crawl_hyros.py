import glob, re, os, subprocess, sys, shutil

TOOLS = os.path.dirname(os.path.abspath(__file__))
from bs4 import BeautifulSoup

def have():
    out=set()
    for f in glob.glob("cache-hyros/*.html"):
        u="https://"+os.path.basename(f)[:-5].replace("__","/")
        out.add(u.split("/docs/",1)[1] if "/docs/" in u else u.rsplit("/",1)[-1])
    return out

for ronda in range(1, 6):
    h=have()
    cands=set()
    for f in glob.glob("cache-hyros/*.html"):
        s=BeautifulSoup(open(f,encoding="utf-8"),"lxml")
        m=s.find("main")
        if not m: continue
        for card in m.select("div.group.rounded-lg"):
            hh=card.find(["h4","h3"])
            if not hh: continue
            k=re.sub(r'[^a-z0-9]+','-',hh.get_text(" ",strip=True).strip().lower()).strip('-')
            if k and k not in h: cands.add(k)
        for a in m.select('a[href^="/docs/"]'):
            k=a["href"].split("/docs/",1)[1].strip("/")
            if k and k not in h: cands.add(k)
    print("ronda %d: %d candidatos nuevos" % (ronda, len(cands)), flush=True)
    if not cands: break
    open("hyros-cands.txt","w").write("\n".join("/docs/"+c for c in sorted(cands))+"\n")
    shutil.rmtree("cache-hyros-cand", ignore_errors=True)
    subprocess.run([sys.executable, os.path.join(TOOLS,"render.py"),"https://docs.hyros.com","hyros-cands.txt","cache-hyros-cand","main"],check=True)
    ok=bad=0
    for f in glob.glob("cache-hyros-cand/*.html"):
        s=BeautifulSoup(open(f,encoding="utf-8"),"lxml")
        m=s.find("main"); t=m.get_text(" ",strip=True) if m else ""
        h1=m.find("h1") if m else None
        if not m or len(t)<250 or not h1: bad+=1; continue
        shutil.copy(f,"cache-hyros/"+os.path.basename(f)); ok+=1
    print("   +%d válidas, %d descartadas, total %d" % (ok,bad,len(glob.glob("cache-hyros/*.html"))), flush=True)
    if ok==0: break

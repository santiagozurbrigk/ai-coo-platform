# -*- coding: utf-8 -*-
"""Renderiza rutas de una SPA con Chromium y guarda el HTML ya hidratado."""
import os, sys, json, time
from playwright.sync_api import sync_playwright

BASE = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
os.makedirs(BASE, exist_ok=True)
origin = sys.argv[1]
url_file = sys.argv[2]
outdir = os.path.join(BASE, sys.argv[3])
sel = sys.argv[4] if len(sys.argv) > 4 else "main"
os.makedirs(outdir, exist_ok=True)

urls = [l.strip() for l in open(url_file) if l.strip()]
fails = []
with sync_playwright() as p:
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    browser = p.chromium.launch(
        executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
        args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-features=EncryptedClientHello,PostQuantumKyber",
              "--ssl-version-max=tls1.2", "--no-first-run", "--disable-background-networking",
              "--disable-component-update", "--disable-sync"],
        proxy={"server": proxy} if proxy else None)
    page = browser.new_page(viewport={"width": 1400, "height": 2000})
    for i, u in enumerate(urls, 1):
        full = u if u.startswith("http") else origin.rstrip("/") + u
        dest = os.path.join(outdir, full.split("://", 1)[1].replace("/", "__") + ".html")
        if os.path.exists(dest) and os.path.getsize(dest) > 3000:
            continue
        try:
            page.goto(full, wait_until="networkidle", timeout=45000)
            try:
                page.wait_for_selector(sel, timeout=8000)
            except Exception:
                pass
            page.wait_for_timeout(600)
            open(dest, "w", encoding="utf-8").write(page.content())
        except Exception as e:
            fails.append((full, str(e)[:120]))
        if i % 25 == 0:
            print("...", i, flush=True)
    browser.close()
print("total", len(urls), "fails", len(fails))
for f in fails[:15]:
    print("FAIL", f)

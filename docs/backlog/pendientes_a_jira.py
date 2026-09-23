#!/usr/bin/env python3
"""Genera el CSV de importación a Jira a partir de PENDIENTES.md.

PENDIENTES.md es la única fuente del backlog. Este CSV es derivado: no se edita a mano,
se regenera. Uso (desde la raíz del repo):

    python3 docs/backlog/pendientes_a_jira.py           # escribe docs/backlog/jira-import.csv
    python3 docs/backlog/pendientes_a_jira.py --check   # sólo valida, no escribe

--check falla si hay IDs repetidos, un ítem P0/P1 sin criterio de aceptación, severidad, riesgo o
impacto, una severidad fuera de la escala, o si el índice por área no coincide con los ítems.
Sólo usa la biblioteca estándar.
"""

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "PENDIENTES.md"
OUT = ROOT / "docs" / "backlog" / "jira-import.csv"

PRIORIDAD_JIRA = {"P0": "Highest", "P1": "High", "P2": "Medium", "P3": "Low"}

# Área (encabezado `## ` de PENDIENTES.md) → etiqueta corta y doc del área.
AREAS = {
    "Plataforma": ("plataforma", "docs/areas/plataforma.md"),
    "Clientes": ("clientes", "docs/areas/clientes.md"),
    "Ventas": ("ventas", "docs/areas/ventas.md"),
    "Marketing": ("marketing", "docs/areas/marketing.md"),
    "Embudos y Lanzamientos": ("embudos", "docs/areas/embudos.md"),
    "Agente de negocio e IA": ("agente-ia", "docs/areas/agente-ia.md"),
    "Operaciones, Finanzas y Producto": ("ops-fin-prod", "docs/areas/operaciones.md"),
    "Infraestructura, seguridad y tests (transversal)": ("infra", "docs/arquitectura/vision-general.md"),
}

CAMPOS = ["Tipo", "Severidad", "Parte de", "Estado verificado", "Riesgo", "Impacto", "Qué hay que hacer",
          "Criterio de aceptación", "Dónde"]
SEVERIDADES = ("Crítica", "Alta", "Media", "Baja")


def area_de(encabezado):
    for nombre, datos in AREAS.items():
        if encabezado.startswith(nombre):
            return nombre, datos
    return None, None


def slug(texto):
    texto = texto.lower()
    for a, b in zip("áéíóúñ", "aeioun"):
        texto = texto.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", texto).strip("-")


def tipo_jira(tipo):
    """Bug para bugs y seguridad, Story para features, Task para el resto."""
    primero = re.split(r"[/+(]", tipo)[0].strip().lower()
    if primero in ("bug", "seguridad"):
        return "Bug"
    if primero == "feature":
        return "Story"
    return "Task"


def etiquetas_tipo(tipo):
    partes = re.split(r"[/+]", re.sub(r"\(.*?\)", "", tipo))
    return [slug(p) for p in partes if p.strip()]


def md_a_jira(texto):
    """Markdown mínimo → wiki markup de Jira."""
    texto = re.sub(r"`([^`]+)`", r"{{\1}}", texto)
    texto = re.sub(r"\*\*([^*]+)\*\*", r"*\1*", texto)
    texto = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"[\1|\2]", texto)
    return texto


def parsear():
    items = []
    area = area_datos = prioridad = None
    item = campo = None

    def cerrar():
        if item:
            items.append(item)

    for linea in SRC.read_text(encoding="utf-8").splitlines():
        if linea.startswith("## "):
            campo = None
            nombre, datos = area_de(linea[3:].strip())
            if nombre:
                cerrar()
                item = None
                area, area_datos, prioridad = nombre, datos, None
            continue
        m = re.match(r"^### .*·\s*(P[0-3])\b", linea)
        if m:
            cerrar()
            item, campo, prioridad = None, None, m.group(1)
            continue
        m = re.match(r"^#### \[([^\]]+)\]\s*(.*)$", linea)
        if m and area and prioridad:
            cerrar()
            item = {"id": m.group(1), "titulo": m.group(2).strip(), "area": area,
                    "area_datos": area_datos, "prioridad": prioridad, "campos": {}}
            campo = None
            continue
        if item is None:
            continue
        m = re.match(r"^- \*\*([^*]+):\*\*\s*(.*)$", linea)
        if m and m.group(1) in CAMPOS:
            campo = m.group(1)
            item["campos"][campo] = m.group(2).strip()
        elif linea.startswith("---"):
            cerrar()
            item = campo = None
        elif campo and linea.strip():
            item["campos"][campo] += " " + linea.strip()
        elif not linea.strip():
            campo = None
    cerrar()
    return items


def validar(items):
    errores = []
    vistos = {}
    for it in items:
        if it["id"] in vistos:
            errores.append(f"ID repetido: [{it['id']}]")
        vistos[it["id"]] = True
        if it["prioridad"] in ("P0", "P1"):
            for campo in ("Criterio de aceptación", "Severidad", "Riesgo", "Impacto"):
                if not it["campos"].get(campo):
                    errores.append(f"{it['prioridad']} sin {campo.lower()}: [{it['id']}]")
        sev = it["campos"].get("Severidad")
        if sev and sev not in SEVERIDADES:
            errores.append(f"Severidad inválida '{sev}': [{it['id']}]")

    # El índice por área del encabezado tiene que coincidir con los ítems reales.
    conteo = {}
    for it in items:
        conteo[(it["area"], it["prioridad"])] = conteo.get((it["area"], it["prioridad"]), 0) + 1
    for linea in SRC.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\| \[([^\]]+)\]\(#[^)]*\) \|[^|]*\|" + r"\s*(\d+)\s*\|" * 4 + r"$", linea)
        if not m:
            continue
        nombre, _ = area_de(m.group(1))
        if nombre:
            esperado = [conteo.get((nombre, p), 0) for p in PRIORIDAD_JIRA]
            if [int(m.group(i)) for i in range(2, 6)] != esperado:
                errores.append(f"Índice por área desactualizado en {nombre}: debería ser {esperado}")
    return errores


def fila(it):
    c = it["campos"]
    tipo = c.get("Tipo", "")
    etiqueta_area, doc = it["area_datos"]
    etiquetas = [etiqueta_area, it["prioridad"].lower()]
    if c.get("Severidad"):
        etiquetas.append("sev-" + slug(c["Severidad"]))
    etiquetas += etiquetas_tipo(tipo)
    if "Parte de" in c:
        etiquetas.append("permisos-transversal")
    etiquetas = list(dict.fromkeys(etiquetas))[:6]
    etiquetas += [""] * (6 - len(etiquetas))

    partes = [f"*{nombre}:* {md_a_jira(c[nombre])}" for nombre in CAMPOS if c.get(nombre)]
    if not partes:
        partes.append("_Ítem sin detalle en PENDIENTES.md: completar al refinarlo._")
    partes.append(f"Fuente: PENDIENTES.md [{it['id']}] · Doc del área: {doc}")
    resumen = f"[{it['id']}] {it['titulo'].replace('`', '')}"[:250]

    return [resumen, tipo_jira(tipo), PRIORIDAD_JIRA[it["prioridad"]], *etiquetas,
            "\n\n".join(partes), it["id"], it["area"], it["prioridad"], c.get("Severidad", ""), tipo]


def main():
    items = parsear()
    errores = validar(items)
    conteo = {}
    for it in items:
        conteo[it["prioridad"]] = conteo.get(it["prioridad"], 0) + 1
    print(f"{len(items)} ítems · " + " · ".join(f"{p}: {conteo.get(p, 0)}" for p in PRIORIDAD_JIRA))
    if errores:
        print("\n".join(errores), file=sys.stderr)
        sys.exit(1)
    if "--check" in sys.argv:
        return

    orden = {p: i for i, p in enumerate(PRIORIDAD_JIRA)}
    items.sort(key=lambda it: (orden[it["prioridad"]], list(AREAS).index(it["area"])))
    with OUT.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Summary", "Issue Type", "Priority", "Labels", "Labels", "Labels", "Labels", "Labels", "Labels",
                    "Description", "ID Limitless", "Área", "Prioridad Limitless", "Severidad", "Tipo Limitless"])
        for it in items:
            w.writerow(fila(it))
    print(f"Escrito {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

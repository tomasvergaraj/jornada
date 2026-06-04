"""Validación por invariante: la suma de las horas extra por día debe cuadrar
con los totales del resumen del PDF. Es lo que permite garantizar exactitud
independientemente del motor de lectura."""
from __future__ import annotations
from .parser import ParseResult


def _fmt(mins):
    if mins is None:
        return "—"
    return f"{mins // 60}:{mins % 60:02d}"


def validate(result: ParseResult) -> dict:
    suma_diurna = sum(j.diurna_min for j in result.jornadas)
    suma_noct = sum(j.nocturna_min for j in result.jornadas)
    r = result.resumen

    checks = []
    ok = True

    def check(nombre, suma, total):
        nonlocal ok
        if total is None:
            checks.append({"campo": nombre, "estado": "sin_referencia",
                           "suma": _fmt(suma), "total_resumen": "—"})
            return
        coincide = suma == total
        ok = ok and coincide
        checks.append({"campo": nombre, "estado": "ok" if coincide else "discrepancia",
                       "suma": _fmt(suma), "total_resumen": _fmt(total),
                       "diferencia_min": (suma - total)})

    check("Horas extra diurnas", suma_diurna, r.extra_diurnas_min)
    check("Horas extra nocturnas y festivas", suma_noct, r.extra_noct_fest_min)

    return {"ok": ok, "checks": checks,
            "mensaje": ("Los totales cuadran con el resumen del PDF."
                        if ok else
                        "Hay diferencias con el resumen del PDF: revisa las jornadas marcadas.")}

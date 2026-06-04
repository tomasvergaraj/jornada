"""Orquesta los motores de extracción y arma el resultado para la API:
prueba texto nativo, cae a OCR si no hay capa de texto, valida por invariante
y propone destino (compensación / pago) y nivel de confianza por jornada."""
from __future__ import annotations
from collections import Counter
from .text_engine import TextEngine
from .ocr_engine import OcrEngine
from .parser import ParseResult
from .validation import validate

# Orden de los motores. Para enchufar un modelo de visión (v2), basta con
# anteponer/añadir su instancia aquí; el resto del sistema no cambia.
ENGINES = [TextEngine(), OcrEngine()]


def _hhmm(mins):
    return None if mins is None else f"{mins // 60:02d}:{mins % 60:02d}"


def _moda(valores, defecto):
    if not valores:
        return defecto
    return Counter(valores).most_common(1)[0][0]


def extract(pdf_bytes: bytes) -> dict:
    parsed: ParseResult | None = None
    source = "ninguno"
    for eng in ENGINES:
        parsed = eng.parse(pdf_bytes)
        if parsed is not None:
            source = eng.name
            break
    if parsed is None:
        parsed = ParseResult()

    val = validate(parsed)
    diurna_ok = any(c["campo"].startswith("Horas extra diurnas") and c["estado"] == "ok"
                    for c in val["checks"])
    noct_ok = any("nocturnas" in c["campo"].lower() and c["estado"] == "ok"
                  for c in val["checks"])

    jornadas = []
    for j in parsed.jornadas:
        if j.diurna_min <= 0 and j.nocturna_min <= 0:
            continue
        destino = "comp" if j.diurna_min > 0 else "pago"
        confiable = (j.diurna_min > 0 and diurna_ok) or (j.nocturna_min > 0 and noct_ok)
        jornadas.append({
            "fecha": j.fecha.isoformat(),
            "dia_semana": j.dia_semana,
            "ingreso": _hhmm(j.ingreso_min),
            "salida": _hhmm(j.salida_min),
            "diurna_min": j.diurna_min,
            "nocturna_min": j.nocturna_min,
            "total_min": j.total_min,
            "destino": destino,
            "confianza": "alta" if (source == "text" or confiable) else "revisar",
            "justificacion": "",
        })
    jornadas.sort(key=lambda x: x["fecha"])

    mes = _moda(parsed.meses_detectados, None)
    anio = _moda(parsed.anios_detectados, None)

    return {
        "source": source,             # "text" | "ocr" | "ninguno"
        "mes": mes,
        "anio": anio,
        "jornadas": jornadas,
        "resumen": {
            "normales_min": parsed.resumen.normales_min,
            "extra_diurnas_min": parsed.resumen.extra_diurnas_min,
            "extra_noct_fest_min": parsed.resumen.extra_noct_fest_min,
            "total_trabajadas_min": parsed.resumen.total_trabajadas_min,
        },
        "validacion": val,
    }

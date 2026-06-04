"""
Parser de la Planilla de Control de Asistencia.

Funciona tanto sobre texto nativo (PDF descargado) como sobre el texto producido
por OCR (PDF escaneado). Incluye coerción de confusiones típicas de OCR en los
campos numéricos, manteniendo el comportamiento inocuo sobre texto limpio.

Estructura del documento (verificada contra el formato real del hospital):
  Día | Horario Programado | Horario Realizado | Horas Normales |
  Horas Nocturnas | Horas Extras Diurnas | Total Horas Trabajadas | Atrasos
Es decir, por fila: 2 rangos horarios + 5 valores "HHh,MMm" en ese orden.
El resumen entrega los totales de control que usamos como invariante.
"""
from __future__ import annotations
import re
from dataclasses import dataclass, field
from datetime import date

# --- Mapa de confusiones OCR -> dígito (aplicado solo en contexto numérico) ---
_DIGIT_MAP = str.maketrans({
    "O": "0", "o": "0", "Q": "0", "D": "0", "U": "0", "Ú": "0", "£": "0", "c": "0", "C": "0", "°": "0",
    "l": "1", "I": "1", "i": "1", "|": "1", "!": "1", "t": "1",
    "Z": "2", "z": "2",
    "E": "3",
    "A": "4",
    "S": "5", "s": "5",
    "G": "6", "é": "6", "&": "6", "b": "6",
    "T": "7",
    "B": "8",
    "g": "9", "q": "9", "%": "9",
})

# clase de caracteres aceptados como "dígito ruidoso"
_NOISY = r"0-9OoQDUÚ£cC°llIi\|!tZzEASsGé&bTBgq%"

_DATE = re.compile(r"(\d{2})/(\d{2})/(\d{4})")
_DAY = re.compile(r"\b(lun|mar|mié|mie|jue|vie|sáb|sab|dom)\b", re.I)
_HM = re.compile(rf"([{_NOISY}]{{1,3}})\s*[H#£h]\s*[,\.]?\s*([{_NOISY}]{{1,3}})\s*m", re.I)
_TIME = re.compile(rf"([{_NOISY}]{{1,2}})[:\.]([{_NOISY}]{{2}})\s*[-–\.]\s*([{_NOISY}]{{1,2}})[:\.]([{_NOISY}]{{2}})")

_DAY_NORM = {"mie": "mié", "sab": "sáb"}


def _digits(s: str) -> str:
    return re.sub(r"\D", "", s.translate(_DIGIT_MAP))


def _hm_to_min(a: str, b: str):
    h, m = _digits(a), _digits(b)
    if h == "" or m == "":
        return None
    return int(h[-2:]) * 60 + int(m[-2:])


def _time_to_min(a: str, b: str):
    h, m = _digits(a), _digits(b)
    if h == "" or m == "":
        return None
    hh, mm = int(h[-2:]), int(m[-2:])
    if hh > 23 or mm > 59:
        return None
    return hh * 60 + mm


@dataclass
class Jornada:
    fecha: date
    dia_semana: str
    ingreso_min: int | None
    salida_min: int | None
    diurna_min: int
    nocturna_min: int
    total_min: int


@dataclass
class Resumen:
    normales_min: int | None = None
    extra_diurnas_min: int | None = None
    extra_noct_fest_min: int | None = None
    total_trabajadas_min: int | None = None


@dataclass
class ParseResult:
    jornadas: list[Jornada] = field(default_factory=list)
    resumen: Resumen = field(default_factory=Resumen)
    meses_detectados: list[int] = field(default_factory=list)
    anios_detectados: list[int] = field(default_factory=list)


def _resumen_value(text: str, label_pattern: str):
    """Busca un total del resumen: la etiqueta seguida (cerca) de un HHh,MMm."""
    rx = re.compile(label_pattern + rf"[^0-9]{{0,12}}([{_NOISY}]{{1,3}})\s*[H#£h]\s*[,\.]?\s*([{_NOISY}]{{1,3}})\s*m", re.I)
    m = rx.search(text)
    return _hm_to_min(m.group(1), m.group(2)) if m else None


def parse_planilla(text: str) -> ParseResult:
    res = ParseResult()
    for ln in text.split("\n"):
        dm = _DATE.search(ln)
        if not dm:
            continue
        d, mo, y = int(dm.group(1)), int(dm.group(2)), int(dm.group(3))
        if not (1 <= mo <= 12 and 1 <= d <= 31 and 2000 <= y <= 2099):
            continue

        day_m = _DAY.search(ln)
        dia = (day_m.group(1).lower() if day_m else "")
        dia = _DAY_NORM.get(dia, dia)

        ranges = [r for r in (_time_to_min(a, b) is not None and (a, b, c, e) or None
                              for (a, b, c, e) in _TIME.findall(ln)) if r]
        # rangos como pares (ingreso, salida)
        pares = []
        for (a, b, c, e) in ranges:
            ini = _time_to_min(a, b)
            fin = _time_to_min(c, e)
            pares.append((ini, fin))

        vals = []
        for a, b in _HM.findall(ln):
            v = _hm_to_min(a, b)
            if v is not None:
                vals.append(v)

        # columnas: [0]=Normales [1]=Nocturnas [2]=ExtrasDiurnas [3]=Total [4]=Atrasos
        diurna = vals[2] if len(vals) >= 3 else 0
        nocturna = vals[1] if len(vals) >= 2 else 0
        total = vals[3] if len(vals) >= 4 else 0

        # Horario realizado. Las horas extra diurnas de jornada flexible se
        # acumulan al final del día, por lo que la salida realizada = salida
        # programada + extra diurna (y la extra ya está validada por invariante).
        # La salida programada es la más temprana entre los rangos leídos. Esto
        # es robusto cuando el OCR sólo alcanza a leer un rango.
        con_salida = [p for p in pares if p[1] is not None]
        if con_salida:
            prog = min(con_salida, key=lambda p: p[1])
            ingreso = prog[0]
            salida = (prog[1] + diurna) if diurna > 0 else prog[1]
            if salida is None or salida >= 24 * 60:           # respaldo defensivo
                ingreso, salida = max(con_salida, key=lambda p: p[1])
        elif pares:
            ingreso, salida = pares[0]
        else:
            ingreso, salida = (None, None)

        # ingreso/salida 00:00 = no trabajó realmente
        if ingreso == 0 and salida == 0:
            ingreso = salida = None

        try:
            f = date(y, mo, d)
        except ValueError:
            continue

        res.jornadas.append(Jornada(f, dia, ingreso, salida, diurna, nocturna, total))
        res.meses_detectados.append(mo)
        res.anios_detectados.append(y)

    # resumen
    res.resumen.normales_min = _resumen_value(text, r"NORMALES")
    res.resumen.extra_diurnas_min = _resumen_value(text, r"DIURNA")
    res.resumen.extra_noct_fest_min = _resumen_value(text, r"NOCTURN")
    res.resumen.total_trabajadas_min = _resumen_value(text, r"TOTAL\s+HORAS\s+TRABAJ")

    return res

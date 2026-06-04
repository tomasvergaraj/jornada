"""Mapeo de celdas de las dos planillas oficiales (verificado contra los
archivos reales del hospital). Misma estructura de columnas A–G; cambian las
filas de inicio y los campos de mes/año."""

MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
         "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]

FORMS = {
    "comp": {
        "label": "Compensación de horas",
        "archivo": "comp.xlsx",
        "nombre_salida": "Solicitud_Compensacion",
        "day_offset": 18, "day_rows": (19, 49),
        "total_diurna": "F50", "total_fest": "G50",
        "rango_diurna": "F19:F49", "rango_fest": "G19:G49",
        "mes": {"tipo": "fecha", "celda": "F8", "fmt": "mmm-yy"},
        "ident": {"nombre": "B7", "rut": "B9", "cargo": "B11", "grado": "B13", "servicio": "B15"},
        "titulo": "SOLICITUD HORAS EXTRAS A COMPENSACIÓN HORARIA",
    },
    "pago": {
        "label": "Pago de horas",
        "archivo": "pago.xlsx",
        "nombre_salida": "Justificacion_Pago",
        "day_offset": 15, "day_rows": (16, 46),
        "total_diurna": "F47", "total_fest": "G47",
        "rango_diurna": "F16:F46", "rango_fest": "G16:G46",
        "mes": {"tipo": "separado", "celda_mes": "B10", "celda_anio": "B11"},
        "ident": {"nombre": "B7", "rut": "B8", "cargo": "F7", "grado": "F8", "servicio": "B9"},
        "titulo": "JUSTIFICACIÓN Y PAGO DE HORAS EXTRAORDINARIAS",
    },
}

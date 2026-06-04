"""Esquemas Pydantic de entrada/salida de la API."""
from typing import Optional, Literal
from pydantic import BaseModel


class Jornada(BaseModel):
    fecha: str                                  # ISO yyyy-mm-dd
    dia_semana: str = ""
    ingreso: Optional[str] = None               # "HH:MM"
    salida: Optional[str] = None
    diurna_min: int = 0
    nocturna_min: int = 0
    total_min: int = 0
    destino: Literal["comp", "pago"] = "comp"
    confianza: str = "alta"
    justificacion: str = ""


class Resumen(BaseModel):
    normales_min: Optional[int] = None
    extra_diurnas_min: Optional[int] = None
    extra_noct_fest_min: Optional[int] = None
    total_trabajadas_min: Optional[int] = None


class ValidacionCheck(BaseModel):
    campo: str
    estado: str
    suma: str
    total_resumen: str
    diferencia_min: Optional[int] = None


class Validacion(BaseModel):
    ok: bool
    checks: list[ValidacionCheck]
    mensaje: str


class ExtractResponse(BaseModel):
    source: str
    mes: Optional[int] = None
    anio: Optional[int] = None
    jornadas: list[Jornada]
    resumen: Resumen
    validacion: Validacion


class Perfil(BaseModel):
    nombre: str = ""
    rut: str = ""
    cargo: str = ""
    grado: str = ""
    servicio: str = ""


class GenerateRequest(BaseModel):
    mes: int
    anio: int
    jornadas: list[Jornada]
    # El perfil viaja en la petición: cada persona lo mantiene en su propio
    # navegador (localStorage), no en una fila global compartida.
    perfil: Optional[Perfil] = None


class PlantillaInfo(BaseModel):
    form_key: str
    label: str
    archivo: Optional[str] = None
    actualizado: Optional[str] = None
    existe: bool

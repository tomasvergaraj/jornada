"""Interfaz de motor de extracción. Permite enchufar nuevos motores (texto, OCR
y, a futuro, modelos de visión) sin tocar el resto del sistema."""
from __future__ import annotations
from abc import ABC, abstractmethod
from .parser import ParseResult


class ExtractorEngine(ABC):
    #: identificador del motor (queda registrado en el resultado y la auditoría)
    name: str = "base"

    @abstractmethod
    def parse(self, pdf_bytes: bytes) -> ParseResult | None:
        """Devuelve un ParseResult, o None si este motor no aplica al documento
        (p. ej. el motor de texto ante un PDF escaneado sin capa de texto)."""
        raise NotImplementedError

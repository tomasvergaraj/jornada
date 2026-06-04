"""Motor de texto nativo: para PDF descargado del sistema (con capa de texto).
Usa PyMuPDF y, como respaldo, pdfplumber. No requiere dependencias de sistema."""
from __future__ import annotations
import fitz  # PyMuPDF
from .base import ExtractorEngine
from .parser import parse_planilla, ParseResult


def extract_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = "\n".join(page.get_text() or "" for page in doc)
    doc.close()
    if text.strip():
        return text
    # respaldo: pdfplumber
    try:
        import pdfplumber, io
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)
    except Exception:
        return text


class TextEngine(ExtractorEngine):
    name = "text"

    def parse(self, pdf_bytes: bytes) -> ParseResult | None:
        text = extract_text(pdf_bytes)
        result = parse_planilla(text)
        # si no hay capa de texto utilizable, ceder al siguiente motor (OCR)
        if not result.jornadas and result.resumen.extra_diurnas_min is None:
            return None
        return result

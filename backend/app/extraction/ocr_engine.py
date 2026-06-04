"""
Motor de OCR para planillas escaneadas.

Renderiza cada página con PyMuPDF (no requiere Poppler), aplica el
preprocesamiento que mejor resultó en pruebas reales (escala de grises a 400 DPI
+ reescalado 1.5x, sin binarización agresiva) y reconoce con Tesseract en español.
"""
from __future__ import annotations
import io
import cv2
import numpy as np
import fitz  # PyMuPDF
import pytesseract

DPI = 400
UPSCALE = 1.5
TESS_CONFIG = "--oem 1 --psm 6 -l spa"


def _page_to_gray(page: "fitz.Page") -> np.ndarray:
    pix = page.get_pixmap(dpi=DPI)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    if pix.n >= 3:
        img = cv2.cvtColor(img[:, :, :3], cv2.COLOR_RGB2GRAY)
    return img


def _preprocess(gray: np.ndarray) -> np.ndarray:
    g = cv2.resize(gray, None, fx=UPSCALE, fy=UPSCALE, interpolation=cv2.INTER_CUBIC)
    return g


def extract_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    parts = []
    for page in doc:
        gray = _page_to_gray(page)
        img = _preprocess(gray)
        parts.append(pytesseract.image_to_string(img, config=TESS_CONFIG))
    doc.close()
    return "\n".join(parts)


from .base import ExtractorEngine          # noqa: E402
from .parser import parse_planilla, ParseResult  # noqa: E402


class OcrEngine(ExtractorEngine):
    name = "ocr"

    def parse(self, pdf_bytes: bytes) -> ParseResult:
        return parse_planilla(extract_text(pdf_bytes))

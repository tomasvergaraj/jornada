from fastapi import APIRouter, UploadFile, File, HTTPException
from ..schemas import ExtractResponse
from ..extraction.pipeline import extract as run_extract
from ..config import settings

router = APIRouter()


@router.post("/extract", response_model=ExtractResponse)
async def extract_endpoint(archivo: UploadFile = File(...)):
    if not (archivo.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sube un archivo PDF.")
    data = await archivo.read()
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"El archivo supera {settings.max_upload_mb} MB.")
    try:
        return run_extract(data)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"No se pudo procesar el PDF: {e}")

from fastapi import APIRouter
import shutil, subprocess

router = APIRouter()


@router.get("/health")
def health():
    tess = "no disponible"
    try:
        if shutil.which("tesseract"):
            out = subprocess.run(["tesseract", "--version"], capture_output=True, text=True)
            tess = out.stdout.splitlines()[0] if out.stdout else tess
    except Exception:
        pass
    return {"status": "ok", "ocr": tess, "motores": ["text", "ocr"]}

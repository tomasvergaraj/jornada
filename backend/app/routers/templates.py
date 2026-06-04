from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os, io
from datetime import datetime
from openpyxl import load_workbook
from ..db import get_db
from ..models import Plantilla
from ..schemas import PlantillaInfo
from ..xlsx.forms import FORMS
from ..config import settings

router = APIRouter()


@router.get("/templates", response_model=list[PlantillaInfo])
def list_templates(db: Session = Depends(get_db)):
    out = []
    for fk, cfg in FORMS.items():
        p = os.path.join(settings.templates_dir, cfg["archivo"])
        row = db.get(Plantilla, fk)
        out.append(PlantillaInfo(
            form_key=fk, label=cfg["label"],
            archivo=(row.archivo if row else None),
            actualizado=(row.actualizado.isoformat() if row else None),
            existe=os.path.exists(p)))
    return out


@router.post("/templates/{form_key}", response_model=PlantillaInfo)
async def upload_template(form_key: str, archivo: UploadFile = File(...), db: Session = Depends(get_db)):
    if form_key not in FORMS:
        raise HTTPException(status_code=404, detail="Formulario desconocido.")
    if not (archivo.filename or "").lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Sube un archivo .xlsx.")
    data = await archivo.read()
    try:
        load_workbook(io.BytesIO(data))
    except Exception:
        raise HTTPException(status_code=400, detail="El archivo no es un .xlsx válido.")
    os.makedirs(settings.templates_dir, exist_ok=True)
    with open(os.path.join(settings.templates_dir, FORMS[form_key]["archivo"]), "wb") as f:
        f.write(data)
    row = db.get(Plantilla, form_key)
    if not row:
        row = Plantilla(form_key=form_key)
        db.add(row)
    row.archivo = archivo.filename
    row.actualizado = datetime.utcnow()
    db.commit()
    return PlantillaInfo(form_key=form_key, label=FORMS[form_key]["label"],
                         archivo=row.archivo, actualizado=row.actualizado.isoformat(), existe=True)

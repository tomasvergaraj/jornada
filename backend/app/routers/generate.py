from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
import io, os, json, zipfile
from ..db import get_db
from ..models import Auditoria
from ..schemas import GenerateRequest
from ..config import settings
from ..xlsx.forms import FORMS, MESES
from ..xlsx.filler import fill

router = APIRouter()
XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _min(t):
    if not t:
        return None
    h, m = t.split(":")
    return int(h) * 60 + int(m)


def _to_filler(j):
    return dict(fecha=j.fecha, ingreso_min=_min(j.ingreso), salida_min=_min(j.salida),
                diurna_min=j.diurna_min, fest_min=j.nocturna_min, justificacion=j.justificacion)


@router.post("/generate")
def generate(req: GenerateRequest, db: Session = Depends(get_db)):
    if not (1 <= req.mes <= 12):
        raise HTTPException(status_code=400, detail="Mes inválido.")

    perfil = req.perfil.model_dump() if req.perfil else None

    grupos = {"comp": [], "pago": []}
    for j in req.jornadas:
        grupos[j.destino].append(j)

    archivos = []
    for fk, js in grupos.items():
        if not js:
            continue
        tpath = os.path.join(settings.templates_dir, FORMS[fk]["archivo"])
        if not os.path.exists(tpath):
            raise HTTPException(status_code=400,
                                detail=f"Falta la plantilla de «{FORMS[fk]['label']}». Cárgala en Plantillas.")
        data, _meta = fill(fk, tpath, [_to_filler(x) for x in js], req.mes, req.anio, perfil)
        nombre = f"{FORMS[fk]['nombre_salida']}_{MESES[req.mes - 1].capitalize()}_{req.anio}.xlsx"
        archivos.append((nombre, data, fk))

    if not archivos:
        raise HTTPException(status_code=400, detail="No hay jornadas para generar.")

    db.add(Auditoria(accion="generar", detalle=json.dumps(
        {"mes": req.mes, "anio": req.anio, "formularios": [a[2] for a in archivos],
         "jornadas": len(req.jornadas)}, ensure_ascii=False)))
    db.commit()

    if len(archivos) == 1:
        nombre, data, _ = archivos[0]
        return Response(content=data, media_type=XLSX_MIME,
                        headers={"Content-Disposition": f'attachment; filename="{nombre}"'})

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for nombre, data, _ in archivos:
            z.writestr(nombre, data)
    zname = f"Planillas_{MESES[req.mes - 1].capitalize()}_{req.anio}.zip"
    return Response(content=buf.getvalue(), media_type="application/zip",
                    headers={"Content-Disposition": f'attachment; filename="{zname}"'})

"""Aplicación FastAPI de Jornada."""
import os
import shutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import Base, engine
from . import models  # noqa: F401  (registra las tablas)
from .xlsx.forms import FORMS
from .routers import health, extract, generate, profile, templates


def _seed_templates() -> None:
    """Copia las plantillas base desde seed_dir si faltan. Permite arrancar en
    Docker con un volumen de datos vacío montado sobre /app/data."""
    os.makedirs(settings.templates_dir, exist_ok=True)
    for cfg in FORMS.values():
        dest = os.path.join(settings.templates_dir, cfg["archivo"])
        src = os.path.join(settings.seed_dir, cfg["archivo"])
        if not os.path.exists(dest) and os.path.exists(src):
            shutil.copyfile(src, dest)


def create_app() -> FastAPI:
    _seed_templates()
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title="Jornada API", version="1.0",
                  description="Gestión de horas extraordinarias — Hospital Biprovincial Quillota Petorca")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins or ["*"],
        allow_origin_regex=settings.cors_origin_regex or None,
        allow_methods=["*"], allow_headers=["*"], allow_credentials=False,
        expose_headers=["Content-Disposition"],
    )
    for r in (health, extract, generate, profile, templates):
        app.include_router(r.router, prefix="/api")

    @app.get("/")
    def root():
        return {"app": settings.app_name, "ok": True, "docs": "/docs"}

    return app


app = create_app()

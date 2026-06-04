"""Modelos ORM: plantillas y auditoría. El perfil del funcionario ya no se
guarda en el servidor: vive en el navegador de cada persona (localStorage) y
viaja en la petición de generación. Más adelante se ligará al usuario cuando
se integre la autenticación del establecimiento."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from .db import Base


class Plantilla(Base):
    __tablename__ = "plantillas"
    form_key = Column(String, primary_key=True)       # "comp" | "pago"
    archivo = Column(String, default="")
    actualizado = Column(DateTime, default=datetime.utcnow)


class Auditoria(Base):
    __tablename__ = "auditoria"
    id = Column(Integer, primary_key=True)
    ts = Column(DateTime, default=datetime.utcnow)
    accion = Column(String)
    detalle = Column(Text, default="")
    usuario = Column(String, default="")

<p align="center">
  <img src="assets/logo.svg" alt="Jornada" width="110" height="110" />
</p>

# Jornada

**Horas extraordinarias, en orden.**

Sistema web interno del **Hospital Biprovincial Quillota Petorca** para gestionar las horas
extraordinarias del personal. Lee la *Planilla de Control de Asistencia* (incluso
escaneada), extrae las horas extra con OCR, **valida los totales contra el resumen del
propio PDF**, permite revisar y justificar cada jornada, y **rellena las planillas
oficiales en Excel** listas para firmar.

Desarrollado por la **Unidad TIC**.

---

## Cómo funciona

1. **Subir** el PDF de asistencia (descargado del sistema o escaneado).
2. **Extraer**: el backend intenta leer la capa de texto; si el PDF es escaneado, cae
   automáticamente a **OCR** (Tesseract en español sobre un render de alta resolución).
3. **Validar por invariante**: la suma de las horas extra por día debe cuadrar con los
   totales del resumen del PDF. Esto garantiza la exactitud **independientemente del
   motor de lectura**. Si algo no cuadra, las jornadas se marcan para revisión.
4. **Revisar**: tabla editable con la justificación, el horario y el destino de cada
   jornada (compensación horaria o pago).
5. **Generar**: se rellenan las planillas oficiales `.xlsx` (preservando logos, estilos
   y fórmulas) y se descargan. Si hay jornadas para ambos formularios, se entrega un ZIP.

---

## Arquitectura

```
jornada/
├─ backend/            FastAPI + extracción (OCR) + relleno de planillas
│  ├─ app/
│  │  ├─ extraction/   motores de lectura (texto / OCR) + parser + validación
│  │  ├─ xlsx/         mapeo de celdas y relleno con openpyxl
│  │  ├─ routers/      /extract /generate /profile /templates /health
│  │  ├─ main.py       app FastAPI
│  │  ├─ config.py     configuración por variables de entorno
│  │  ├─ db.py models.py schemas.py
│  └─ data/templates/  planillas oficiales base (.xlsx)
├─ frontend/           Next.js 15 + React 19 + Tailwind v4 (design system Jornada)
├─ docker-compose.yml
└─ .env.example
```

**Stack:** FastAPI · PyMuPDF · Tesseract OCR · OpenCV · openpyxl · SQLAlchemy (SQLite) ·
Next.js · TypeScript · Tailwind v4.

El motor de extracción está detrás de una interfaz (`ExtractorEngine`): se puede enchufar
un modelo de visión en el futuro sin tocar el resto del sistema (ver *Roadmap*).

---

## Requisitos

- Docker y Docker Compose.

No hace falta instalar Python, Node ni Tesseract en el equipo: todo va en los contenedores.

---

## Levantarlo (desarrollo)

```bash
docker compose up --build
```

- Frontend: <http://localhost:3000>
- Backend (API + docs): <http://localhost:8000> · <http://localhost:8000/docs>

Las planillas base que vienen en `backend/data/templates/` se cargan automáticamente en
el primer arranque. La base de datos SQLite se guarda en un volumen (`jornada-data`), así
que el perfil y las plantillas persisten entre reinicios.

Para detener: `docker compose down` (los datos se conservan).
Para borrar también los datos: `docker compose down -v`.

---

## Uso

1. **Perfil** → revisa/confirma tus datos (nombre, RUT, cargo, grado, servicio). Se
   autocompletan desde la plantilla cargada y se escriben en las planillas generadas.
2. **Plantillas** → si cambian las planillas oficiales, súbelas aquí para reemplazarlas.
3. **Generar** → sube el PDF, revisa la tabla, ajusta justificaciones/destinos y descarga.

---

## Configuración (variables de entorno)

| Variable | Servicio | Por defecto | Para qué |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | frontend (build) | `http://localhost:8000` | URL del backend a la que llama el navegador. |
| `CORS_ORIGINS` | backend | `http://localhost:3000,...` | Orígenes permitidos (separados por coma). |
| `DATABASE_URL` | backend | `sqlite:///./data/jornada.db` | Cadena de conexión. Soporta PostgreSQL. |

> `NEXT_PUBLIC_API_URL` se **hornea en el build** del frontend (es una variable de cliente).
> Si cambia la dirección del backend, hay que reconstruir el frontend.

---

## Despliegue en la VM del hospital

Para una VM Linux propia hay dos caminos:

**Opción A — Acceso por IP/host directo.** Construir el frontend apuntando al backend real
y abrir el CORS:

```bash
# .env en la VM
NEXT_PUBLIC_API_URL=http://IP-DE-LA-VM:8000
```
```yaml
# en docker-compose, servicio backend:
environment:
  CORS_ORIGINS: "http://IP-DE-LA-VM:3000"
```

**Opción B — Reverse proxy mismo-origen (recomendada).** Poner un proxy (p. ej. Caddy o
Nginx) delante: el frontend en `/` y el backend en `/api`. Como todo queda en el mismo
origen, se construye el frontend con `NEXT_PUBLIC_API_URL=""` (las llamadas pasan a ser
relativas: `/api/...`) y no hay que tocar el CORS. Ejemplo de `Caddyfile`:

```
jornada.hospital.local {
    handle /api/* {
        reverse_proxy backend:8000
    }
    handle {
        reverse_proxy frontend:3000
    }
}
```

En ambos casos conviene servir por HTTPS y restringir el acceso a la red interna.

---

## Exactitud del OCR (honesto)

Sobre la planilla escaneada real de prueba (mayo 2026), la extracción por OCR logró:

- **Horas extra diurnas: 12/12 exactas** y **validadas por invariante** (la suma por día
  cuadra con el total del resumen del PDF). Es el dato que importa para compensación/pago.
- **Hora de ingreso: 12/12 exactas.**
- **Hora de salida: 11/12 exactas.** La salida se reconstruye como *salida programada +
  extra diurna* (modelo de horas extra de fin de jornada). En casos raros donde el OCR no
  alcanza a leer el horario programado, la salida puede quedar desfasada: **es editable**
  en la tabla de revisión y no afecta al total validado.

La invariante es la garantía: si los totales no cuadran, el sistema lo avisa y marca las
jornadas. Siempre conviene dar una mirada a la tabla antes de generar.

---

## Desarrollo local sin Docker (opcional)

**Backend** (requiere `tesseract-ocr` + `tesseract-ocr-spa` instalados en el sistema):

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

---

## Roadmap

- **v1 (actual):** lectura por texto + OCR determinista con validación por invariante.
- **v2:** motor de visión (VLM) como alternativa de lectura para mayor robustez en
  escaneos difíciles, manteniendo la privacidad de los datos de salud (modelos que no
  entrenan con la información enviada). Se enchufa en `extraction/` sin reescribir el resto.
- **v3:** modelo afinado autoalojado si el volumen lo justifica.

---

*Jornada · Hospital Biprovincial Quillota Petorca · desarrollado por la Unidad TIC*

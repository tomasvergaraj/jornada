"""Configuración por variables de entorno (pydantic-settings)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Jornada"
    # SQLite por defecto (ideal para un despliegue de un solo hospital en VM).
    # Para PostgreSQL basta cambiar esta variable, p. ej.:
    #   postgresql+psycopg://usuario:clave@db:5432/jornada
    database_url: str = "sqlite:///./data/jornada.db"
    data_dir: str = "./data"
    templates_dir: str = "./data/templates"
    seed_dir: str = "./seed"   # plantillas base para primer arranque (Docker)
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    # Regex opcional de orígenes permitidos. Por defecto acepta el frontend en
    # cualquier host (la IP de la VM en la red) sobre el puerto 3000, así se
    # puede entrar desde otros equipos/teléfonos sin reconfigurar por cada IP.
    cors_origin_regex: str = r"https?://[\w.\-]+:3000"
    max_upload_mb: int = 25

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

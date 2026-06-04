export type Destino = "comp" | "pago";

export interface Jornada {
  fecha: string;
  dia_semana: string;
  ingreso: string | null;
  salida: string | null;
  diurna_min: number;
  nocturna_min: number;
  total_min: number;
  destino: Destino;
  confianza: string;
  justificacion: string;
}

export interface Resumen {
  normales_min: number | null;
  extra_diurnas_min: number | null;
  extra_noct_fest_min: number | null;
  total_trabajadas_min: number | null;
}

export interface ValidacionCheck {
  campo: string;
  estado: string;
  suma: string;
  total_resumen: string;
  diferencia_min: number | null;
}

export interface Validacion {
  ok: boolean;
  checks: ValidacionCheck[];
  mensaje: string;
}

export interface ExtractResponse {
  source: string;
  mes: number | null;
  anio: number | null;
  jornadas: Jornada[];
  resumen: Resumen;
  validacion: Validacion;
}

export interface Perfil {
  nombre: string;
  rut: string;
  cargo: string;
  grado: string;
  servicio: string;
}

export interface PlantillaInfo {
  form_key: string;
  label: string;
  archivo: string | null;
  actualizado: string | null;
  existe: boolean;
}

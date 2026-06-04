import { Perfil } from "./types";
import { rutValido } from "./rut";

// El perfil de cada persona vive en su propio navegador (localStorage), no en
// el servidor. Así cada funcionario completa y mantiene sus datos sin pisar a
// los demás. Más adelante esto se reemplazará por la autenticación del
// establecimiento.
const KEY = "jornada.perfil";

export const PERFIL_VACIO: Perfil = {
  nombre: "", rut: "", cargo: "", grado: "", servicio: "",
};

export function cargarPerfil(): Perfil {
  if (typeof window === "undefined") return PERFIL_VACIO;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...PERFIL_VACIO, ...JSON.parse(raw) } : PERFIL_VACIO;
  } catch {
    return PERFIL_VACIO;
  }
}

export function guardarPerfil(p: Perfil): void {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(p));
}

// Mínimo necesario para que las planillas salgan con la identidad correcta:
// nombre y un RUT válido.
export function perfilCompleto(p: Perfil): boolean {
  return Boolean(p.nombre.trim()) && rutValido(p.rut);
}

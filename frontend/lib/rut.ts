// Validación y formateo de RUT chileno (con dígito verificador módulo 11).

// Deja solo dígitos y la K, en mayúscula.
export function limpiarRut(valor: string): string {
  return valor.replace(/[^0-9kK]/g, "").toUpperCase();
}

// Dígito verificador del cuerpo (serie de multiplicadores 2..7).
export function calcularDv(cuerpo: string): string {
  let suma = 0, mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

// Formatea con puntos de miles y guion: 12.345.678-9
export function formatearRut(valor: string): string {
  const limpio = limpiarRut(valor);
  if (limpio.length === 0) return "";
  if (limpio.length === 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${conPuntos}-${dv}`;
}

// Válido si el cuerpo es numérico y el DV coincide.
export function rutValido(valor: string): boolean {
  const limpio = limpiarRut(valor);
  if (limpio.length < 2) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  return calcularDv(cuerpo) === dv;
}

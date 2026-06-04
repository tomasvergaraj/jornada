export const minToHHMM = (m: number | null) =>
  m == null ? "" : `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const minToDur = (m: number | null) =>
  m == null ? "—" : `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

export const hhmmToMin = (s: string): number | null => {
  const x = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!x) return null;
  const h = +x[1], mm = +x[2];
  return h < 24 && mm < 60 ? h * 60 + mm : null;
};

export const fechaCorta = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

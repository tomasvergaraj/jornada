import { minToDur } from "@/lib/time";
import { Jornada } from "@/lib/types";

function Tot({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="card flex flex-col p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 font-mono text-xl tabular-nums">{value}</div>
    </div>
  );
}

export default function Totals({ jornadas }: { jornadas: Jornada[] }) {
  const d = jornadas.reduce((a, j) => a + (j.diurna_min || 0), 0);
  const f = jornadas.reduce((a, j) => a + (j.nocturna_min || 0), 0);
  const comp = jornadas.filter((j) => j.destino === "comp").length;
  const pago = jornadas.filter((j) => j.destino === "pago").length;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tot label="Diurna" value={minToDur(d)} dot="var(--color-amber)" />
      <Tot label="Noct./Fest." value={minToDur(f)} dot="var(--color-indigo)" />
      <Tot label="A compensación" value={`${comp}`} dot="var(--color-teal)" />
      <Tot label="A pago" value={`${pago}`} dot="var(--color-warn)" />
    </div>
  );
}

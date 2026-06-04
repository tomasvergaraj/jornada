"use client";
import type { ReactNode } from "react";
import { Jornada } from "@/lib/types";
import { fechaCorta, minToDur } from "@/lib/time";

function Th({ children }: { children: ReactNode }) {
  return <th className="px-3 py-2 font-medium">{children}</th>;
}

export default function ReviewTable(
  { jornadas, onChange }: { jornadas: Jornada[]; onChange: (i: number, p: Partial<Jornada>) => void }
) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-faint">
            <Th>Fecha</Th><Th>Justificación</Th><Th>Ingreso</Th><Th>Salida</Th>
            <Th>Diurna</Th><Th>Noct./Fest.</Th><Th>Destino</Th>
          </tr>
        </thead>
        <tbody>
          {jornadas.map((j, i) => (
            <tr key={j.fecha + i} className="border-b border-line2 align-top">
              <td className="whitespace-nowrap px-3 py-2 font-mono">
                {fechaCorta(j.fecha)}
                <div className="text-[10px] uppercase text-faint">{j.dia_semana}</div>
                {j.confianza === "revisar" && (
                  <span className="mt-1 inline-block rounded bg-amber-sf px-1.5 py-0.5 text-[10px] text-amber">revisar</span>
                )}
              </td>
              <td className="min-w-[220px] px-2 py-2">
                <input className="inp" value={j.justificacion} placeholder="Motivo del trabajo extraordinario"
                  onChange={(e) => onChange(i, { justificacion: e.target.value })} />
              </td>
              <td className="px-2 py-2">
                <input className="inp w-[88px] font-mono" value={j.ingreso ?? ""}
                  onChange={(e) => onChange(i, { ingreso: e.target.value || null })} />
              </td>
              <td className="px-2 py-2">
                <input className="inp w-[88px] font-mono" value={j.salida ?? ""}
                  onChange={(e) => onChange(i, { salida: e.target.value || null })} />
              </td>
              <td className="px-3 py-2 font-mono">{minToDur(j.diurna_min)}</td>
              <td className="px-3 py-2 font-mono">{j.nocturna_min ? minToDur(j.nocturna_min) : "—"}</td>
              <td className="px-2 py-2">
                <div className="inline-flex overflow-hidden rounded-lg border border-line text-xs">
                  <button onClick={() => onChange(i, { destino: "comp" })}
                    className={`px-2.5 py-1.5 ${j.destino === "comp" ? "bg-teal text-white" : "bg-card text-muted"}`}>Comp.</button>
                  <button onClick={() => onChange(i, { destino: "pago" })}
                    className={`px-2.5 py-1.5 ${j.destino === "pago" ? "bg-amber text-white" : "bg-card text-muted"}`}>Pago</button>
                </div>
              </td>
            </tr>
          ))}
          {jornadas.length === 0 && (
            <tr><td colSpan={7} className="px-3 py-8 text-center text-muted">No se detectaron jornadas con horas extra.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

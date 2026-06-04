import { Validacion } from "@/lib/types";

export default function ValidationBanner({ v, source }: { v: Validacion; source: string }) {
  const ok = v.ok;
  const fuente = source === "ocr" ? "OCR (escaneado)" : source === "text" ? "texto del PDF" : source;
  return (
    <div className={`rounded-xl border p-4 ${ok ? "border-teal-sf bg-teal-sf" : "border-amber-sf bg-amber-sf"}`}>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: ok ? "var(--color-good)" : "var(--color-warn)" }} />
        <strong style={{ color: ok ? "var(--color-teal-dk)" : "var(--color-warn)" }}>{v.mensaje}</strong>
        <span className="ml-auto text-xs text-muted">Fuente: {fuente}</span>
      </div>
      <div className="mt-2 grid gap-1 text-xs text-muted sm:grid-cols-2">
        {v.checks.map((c, i) => (
          <div key={i} className="flex justify-between gap-2 rounded-md bg-white/50 px-2 py-1">
            <span>{c.campo}</span>
            <span className="font-mono">
              {c.suma}{c.total_resumen !== "—" ? ` / ${c.total_resumen}` : ""}{" "}
              {c.estado === "ok" ? "✓" : c.estado === "discrepancia" ? "⚠" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

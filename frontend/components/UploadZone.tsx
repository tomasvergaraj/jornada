"use client";
import { useRef, useState } from "react";

export default function UploadZone({ onFile, loading }: { onFile: (f: File) => void; loading: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
      onClick={() => ref.current?.click()}
      className={`card cursor-pointer p-10 text-center transition-colors ${drag ? "border-teal" : ""}`}>
      <input ref={ref} type="file" accept="application/pdf,.pdf" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div className="text-3xl opacity-40">⬆</div>
      <p className="mt-2 font-display text-lg">{loading ? "Procesando…" : "Arrastra el PDF de asistencia"}</p>
      <p className="text-sm text-muted">
        {loading ? "Leyendo y validando las horas extra" : "o haz clic para elegir el archivo (descargado o escaneado)"}
      </p>
    </div>
  );
}

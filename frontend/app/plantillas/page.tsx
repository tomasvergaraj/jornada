"use client";
import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { PlantillaInfo } from "@/lib/types";

export default function PlantillasPage() {
  const [items, setItems] = useState<PlantillaInfo[]>([]);
  const [msg, setMsg] = useState("");

  const load = () => api.listTemplates().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  async function up(fk: string, f: File) {
    setMsg("");
    try { await api.uploadTemplate(fk, f); setMsg(`Plantilla actualizada.`); load(); }
    catch (e) { setMsg((e as Error).message); }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="kicker">Administración</div>
        <h1 className="text-3xl">Plantillas oficiales</h1>
        <p className="mt-1 text-sm text-muted">Las planillas base (.xlsx) que el sistema rellena. Reemplázalas aquí si cambian.</p>
      </div>
      {msg && <div className="mb-4 rounded-lg border border-teal-sf bg-teal-sf px-4 py-2 text-sm text-teal-dk">{msg}</div>}
      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.form_key} className="card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="font-display text-lg">{t.label}</div>
              <div className="truncate text-xs text-muted">
                {t.existe ? `Cargada${t.archivo ? `: ${t.archivo}` : ""}` : "Sin plantilla"}
                {t.actualizado ? ` · ${new Date(t.actualizado).toLocaleDateString("es-CL")}` : ""}
              </div>
            </div>
            <label className="btn shrink-0 cursor-pointer">
              {t.existe ? "Reemplazar" : "Subir"}
              <input type="file" accept=".xlsx" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) up(t.form_key, f); }} />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

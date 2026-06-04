"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { ExtractResponse, Jornada, Perfil } from "@/lib/types";
import { cargarPerfil, perfilCompleto, PERFIL_VACIO } from "@/lib/perfil";
import Stepper from "@/components/Stepper";
import UploadZone from "@/components/UploadZone";
import ReviewTable from "@/components/ReviewTable";
import Totals from "@/components/Totals";
import ValidationBanner from "@/components/ValidationBanner";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [gen, setGen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractResponse | null>(null);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VACIO);

  // Perfil propio de este navegador (cada persona el suyo).
  useEffect(() => { setPerfil(cargarPerfil()); }, []);
  const perfilListo = perfilCompleto(perfil);

  async function handleFile(f: File) {
    setError(null); setLoading(true);
    try {
      const r = await api.extract(f);
      setData(r); setJornadas(r.jornadas);
      setMes(r.mes ?? new Date().getMonth() + 1);
      setAnio(r.anio ?? new Date().getFullYear());
      setStep(2);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  const patch = (i: number, p: Partial<Jornada>) =>
    setJornadas((js) => js.map((j, k) => (k === i ? { ...j, ...p } : j)));

  async function handleGenerate() {
    setError(null); setGen(true);
    try {
      const { blob, filename } = await api.generate({ mes, anio, jornadas, perfil });
      api.download(blob, filename); setStep(3);
    } catch (e) { setError((e as Error).message); }
    finally { setGen(false); }
  }

  function reset() { setData(null); setJornadas([]); setStep(1); setError(null); }

  return (
    <div>
      <div className="mb-6">
        <div className="kicker">Horas extraordinarias</div>
        <h1 className="text-3xl">Generar planillas</h1>
      </div>
      <Stepper step={step} />

      {error && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "#e7c7c7", background: "#f7ecec", color: "var(--color-bad)" }}>{error}</div>
      )}

      {step === 1 && <UploadZone onFile={handleFile} loading={loading} />}

      {step === 2 && data && (
        <div className="space-y-5">
          <ValidationBanner v={data.validacion} source={data.source} />
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Mes</label>
              <select className="inp w-40" value={mes} onChange={(e) => setMes(+e.target.value)}>
                {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Año</label>
              <input className="inp w-28 font-mono" type="number" value={anio} onChange={(e) => setAnio(+e.target.value)} />
            </div>
          </div>
          <Totals jornadas={jornadas} />
          <ReviewTable jornadas={jornadas} onChange={patch} />
          {!perfilListo && (
            <div className="rounded-lg border px-4 py-3 text-sm"
              style={{ borderColor: "#e7d4b0", background: "var(--color-amber-sf)", color: "var(--color-warn)" }}>
              Completa tu <Link href="/perfil" className="font-medium underline">perfil</Link> (al menos nombre y RUT)
              antes de generar: tus datos se escriben en las planillas.
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn btn-primary" disabled={gen || jornadas.length === 0 || !perfilListo} onClick={handleGenerate}>
              {gen ? "Generando…" : "Generar planillas"}
            </button>
            <button className="btn" onClick={reset}>Volver a empezar</button>
            <span className="text-xs text-muted">Se generan las planillas oficiales y se descargan listas para firmar.</span>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-10 text-center">
          <div className="text-3xl" style={{ color: "var(--color-good)" }}>✓</div>
          <h2 className="mt-2 text-2xl">Planillas generadas</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            La descarga comenzó automáticamente. Revisa, firma y entrega. Si necesitas otro mes, parte de nuevo.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button className="btn btn-primary" onClick={reset}>Procesar otro PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

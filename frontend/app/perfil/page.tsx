"use client";
import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { Perfil } from "@/lib/types";
import { cargarPerfil, guardarPerfil, PERFIL_VACIO } from "@/lib/perfil";
import { formatearRut, rutValido } from "@/lib/rut";

const CAMPOS: [keyof Perfil, string][] = [
  ["nombre", "Nombre completo"], ["rut", "RUT"], ["cargo", "Cargo"],
  ["grado", "Grado"], ["servicio", "Servicio / unidad"],
];

export default function PerfilPage() {
  const [p, setP] = useState<Perfil>(PERFIL_VACIO);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // El perfil vive en este navegador (localStorage), propio de cada persona.
  useEffect(() => { setP(cargarPerfil()); setLoading(false); }, []);

  function save() {
    guardarPerfil(p);
    setMsg("Perfil guardado en este dispositivo.");
  }

  async function autocompletar() {
    setMsg("");
    const s = await api.getProfileSuggestion();
    // Solo rellena los campos vacíos, sin pisar lo que ya escribiste.
    setP((cur) => ({
      nombre: cur.nombre || s.nombre, rut: cur.rut || s.rut, cargo: cur.cargo || s.cargo,
      grado: cur.grado || s.grado, servicio: cur.servicio || s.servicio,
    }));
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <div className="kicker">Datos del funcionario</div>
        <h1 className="text-3xl">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted">
          Estos datos se escriben en tus planillas. Se guardan solo en este dispositivo;
          cada persona completa el suyo.
        </p>
      </div>
      {loading ? <p className="text-muted">Cargando…</p> : (
        <div className="card space-y-4 p-6">
          {CAMPOS.map(([k, label]) => {
            const esRut = k === "rut";
            const rutMalo = esRut && p.rut.trim() !== "" && !rutValido(p.rut);
            return (
              <div key={k}>
                <label className="mb-1 block text-xs uppercase tracking-wide text-muted">{label}</label>
                <input
                  className={`inp${esRut ? " font-mono" : ""}`}
                  value={p[k]}
                  inputMode={esRut ? "text" : undefined}
                  placeholder={esRut ? "12.345.678-9" : undefined}
                  onChange={(e) => setP({ ...p, [k]: e.target.value })}
                  onBlur={esRut ? () => setP((cur) => ({ ...cur, rut: formatearRut(cur.rut) })) : undefined}
                />
                {rutMalo && <p className="mt-1 text-xs" style={{ color: "var(--color-bad)" }}>RUT inválido — revisa el dígito verificador.</p>}
              </div>
            );
          })}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button className="btn btn-primary" onClick={save}>Guardar</button>
            <button className="btn" onClick={autocompletar} type="button">Autocompletar desde la plantilla</button>
            {msg && <span className="text-sm text-muted">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

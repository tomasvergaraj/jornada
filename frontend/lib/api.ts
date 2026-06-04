import { ExtractResponse, Perfil, PlantillaInfo, Jornada } from "./types";
import { PERFIL_VACIO } from "./perfil";

// URL del backend. Si NEXT_PUBLIC_API_URL viene definida en el build, manda
// (útil para un dominio fijo o un proxy). Si no, se resuelve en el navegador:
// mismo host que sirve la página, puerto 8000. Así funciona igual desde
// localhost o desde la IP de la VM en la red, sin reconstruir por cada IP.
function apiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

async function jsonOrThrow(r: Response) {
  if (!r.ok) {
    let d = "";
    try { d = (await r.json()).detail; } catch {}
    throw new Error(d || `Error ${r.status}`);
  }
  return r.json();
}

export async function extract(file: File): Promise<ExtractResponse> {
  const fd = new FormData();
  fd.append("archivo", file);
  return jsonOrThrow(await fetch(`${apiBase()}/api/extract`, { method: "POST", body: fd }));
}

export async function generate(payload: { mes: number; anio: number; jornadas: Jornada[]; perfil: Perfil }):
  Promise<{ blob: Blob; filename: string }> {
  const r = await fetch(`${apiBase()}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    let d = "";
    try { d = (await r.json()).detail; } catch {}
    throw new Error(d || `Error ${r.status}`);
  }
  const cd = r.headers.get("content-disposition") || "";
  const m = /filename="?([^"]+)"?/.exec(cd);
  return { blob: await r.blob(), filename: m ? m[1] : "planillas.xlsx" };
}

// Sugerencia de identidad tomada de la plantilla (para autocompletar la
// primera vez). El perfil real se guarda en localStorage, no en el servidor.
export async function getProfileSuggestion(): Promise<Perfil> {
  try {
    return await jsonOrThrow(await fetch(`${apiBase()}/api/profile`));
  } catch {
    return PERFIL_VACIO;
  }
}

export async function listTemplates(): Promise<PlantillaInfo[]> {
  return jsonOrThrow(await fetch(`${apiBase()}/api/templates`));
}

export async function uploadTemplate(formKey: string, file: File): Promise<PlantillaInfo> {
  const fd = new FormData();
  fd.append("archivo", file);
  return jsonOrThrow(await fetch(`${apiBase()}/api/templates/${formKey}`, { method: "POST", body: fd }));
}

export function download(blob: Blob, filename: string) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = filename;
  // El anchor debe estar en el DOM y la URL del blob NO debe revocarse de
  // inmediato: revocarla en el mismo tick que click() puede cancelar la
  // descarga antes de que el navegador termine de leer el blob, dejando un
  // .xlsx truncado (Excel lo reporta como «libro dañado»).
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  }, 1000);
}

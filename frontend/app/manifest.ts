import type { MetadataRoute } from "next";

// Manifest PWA. Next.js lo sirve en /manifest.webmanifest e inyecta el
// <link rel="manifest"> automáticamente.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jornada — Horas Extraordinarias",
    short_name: "Jornada",
    description:
      "Gestión de horas extraordinarias del Hospital Biprovincial Quillota Petorca.",
    lang: "es-CL",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f6f3ec",
    theme_color: "#125e58",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

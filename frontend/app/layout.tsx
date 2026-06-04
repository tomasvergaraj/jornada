import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Jornada — Horas Extraordinarias",
  description: "Gestión de horas extraordinarias del Hospital Biprovincial Quillota Petorca.",
  applicationName: "Jornada",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jornada",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#125e58",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-faint sm:px-6">
          Jornada · Hospital Biprovincial Quillota Petorca · desarrollado por la Unidad TIC
        </footer>
      </body>
    </html>
  );
}

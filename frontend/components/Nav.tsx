"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const links: [string, string][] = [["/", "Generar"], ["/perfil", "Perfil"], ["/plantillas", "Plantillas"]];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="border-b border-line bg-card/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo size={28} />
          <span className="font-display text-lg sm:text-xl">Jornada</span>
        </Link>
        <nav className="flex gap-0.5 text-[13px] sm:gap-1 sm:text-sm">
          {links.map(([href, label]) => (
            <Link key={href} href={href}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 sm:px-3 ${path === href ? "bg-teal-sf text-teal-dk" : "text-muted hover:bg-paper"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

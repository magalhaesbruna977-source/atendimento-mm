"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Abas internas da curadoria (Sugestões pendentes / Documentos). */
export default function CuradoriaNav() {
  const pathname = usePathname();

  const abas = [
    { href: "/curadoria", rotulo: "Sugestões pendentes", ativo: pathname === "/curadoria" },
    {
      href: "/curadoria/documentos",
      rotulo: "Documentos",
      ativo: pathname.startsWith("/curadoria/documentos"),
    },
  ];

  return (
    <nav aria-label="Seções da curadoria" className="flex flex-wrap gap-1">
      {abas.map((aba) => (
        <Link
          key={aba.href}
          href={aba.href}
          aria-current={aba.ativo ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            aba.ativo
              ? "bg-mm-surface-2 text-mm-text"
              : "text-mm-text-muted hover:bg-mm-surface hover:text-mm-text"
          }`}
        >
          {aba.rotulo}
        </Link>
      ))}
    </nav>
  );
}

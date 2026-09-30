"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";

/**
 * Cabeçalho fixo comum a todas as telas logadas: nome do site à esquerda e
 * navegação principal. Em telas pequenas, a navegação vira um menu
 * colapsável (botão "Menu").
 *
 * A checagem de admin continua sendo feita no servidor — aqui só usamos
 * `isAdmin` para decidir se o link de Curadoria aparece.
 */
export default function SiteHeader({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  const itens = [
    { href: "/", rotulo: "Fazer uma pergunta", ativo: pathname === "/" },
    {
      href: "/material-de-apoio",
      rotulo: "Central de Conhecimento",
      ativo: pathname.startsWith("/material-de-apoio"),
    },
    ...(isAdmin
      ? [{ href: "/curadoria", rotulo: "Curadoria", ativo: pathname.startsWith("/curadoria") }]
      : []),
  ];

  const links = itens.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setMenuAberto(false)}
      aria-current={item.ativo ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        item.ativo
          ? "bg-mm-surface-2 text-mm-text"
          : "text-mm-text-muted hover:bg-mm-surface hover:text-mm-text"
      }`}
    >
      {item.rotulo}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-20 border-b border-mm-border bg-mm-bg">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-mm-text">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-mm-accent text-xs font-extrabold text-white"
          >
            MM
          </span>
          <span className="text-base font-extrabold tracking-tight">
            Atendimento <span className="text-mm-accent">Market Makers</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {links}
          <LogoutButton />
        </nav>

        <button
          type="button"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          aria-expanded={menuAberto}
          aria-controls="menu-mobile"
          className="mm-btn mm-btn-secondary mm-btn-sm md:hidden"
        >
          {menuAberto ? "Fechar" : "Menu"}
        </button>
      </div>

      {menuAberto && (
        <nav
          id="menu-mobile"
          aria-label="Navegação principal"
          className="flex flex-col gap-1 border-t border-mm-border bg-mm-bg px-4 py-3 md:hidden"
        >
          {links}
          <LogoutButton />
        </nav>
      )}
    </header>
  );
}

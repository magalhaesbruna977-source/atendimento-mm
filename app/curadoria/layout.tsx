import Link from "next/link";
import { requireAdminOuRedirecionar } from "@/lib/auth/admin";
import LogoutButton from "../logout-button";

export default async function CuradoriaLayout({ children }: { children: React.ReactNode }) {
  // Redireciona para /login (não autenticado) ou /acesso-negado (não admin)
  // — todas as páginas debaixo de /curadoria passam por essa checagem.
  const { agente } = await requireAdminOuRedirecionar();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Curadoria
          </span>
          <nav className="flex gap-4 text-sm">
            <Link href="/curadoria" className="text-zinc-600 hover:underline dark:text-zinc-400">
              Sugestões pendentes
            </Link>
            <Link
              href="/curadoria/documentos"
              className="text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Documentos
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{agente.nome}</span>
          <Link href="/" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            Voltar ao app
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}

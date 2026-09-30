import { requireAdminOuRedirecionar } from "@/lib/auth/admin";
import SiteHeader from "../site-header";
import CuradoriaNav from "./curadoria-nav";

export default async function CuradoriaLayout({ children }: { children: React.ReactNode }) {
  // Redireciona para /login (não autenticado) ou /acesso-negado (não admin)
  // — todas as páginas debaixo de /curadoria passam por essa checagem.
  const { agente } = await requireAdminOuRedirecionar();

  return (
    <div className="flex min-h-screen flex-col bg-mm-bg">
      <SiteHeader isAdmin={agente.is_admin} />

      <div className="border-b border-mm-border bg-mm-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-lg font-extrabold tracking-tight text-mm-text">Curadoria</span>
            <CuradoriaNav />
          </div>
          <span className="text-sm text-mm-text-muted">{agente.nome}</span>
        </div>
      </div>

      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}

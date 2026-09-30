import { getAgenteLogado } from "@/lib/auth/admin";
import AskForm from "./ask-form";
import SiteHeader from "./site-header";

export default async function Home() {
  const { supabase, agente } = await getAgenteLogado();

  const { data: produtos } = await supabase.from("products").select("id, nome").order("nome");

  return (
    <div className="flex min-h-screen flex-col bg-mm-bg">
      <SiteHeader isAdmin={Boolean(agente?.is_admin)} />

      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex w-full max-w-3xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="mm-eyebrow">Assistente de atendimento</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-mm-text">
              Fazer uma pergunta
            </h1>
            <p className="text-sm text-mm-text-muted">
              Escolha o tópico, digite a dúvida do cliente e receba uma resposta baseada na nossa
              base de conhecimento.
            </p>
          </div>

          <AskForm produtos={produtos ?? []} />
        </div>
      </main>
    </div>
  );
}

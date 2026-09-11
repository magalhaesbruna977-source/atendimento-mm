import { requireAdminOuRedirecionar } from "@/lib/auth/admin";
import NovoDocumentoForm from "./novo-documento-form";

export default async function NovoDocumentoPage({
  searchParams,
}: {
  searchParams: Promise<{ sugestaoId?: string; produtoId?: string }>;
}) {
  const { supabase } = await requireAdminOuRedirecionar();
  const { sugestaoId, produtoId } = await searchParams;

  const { data: produtos } = await supabase.from("products").select("id, nome").order("nome");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Novo documento</h1>
      <NovoDocumentoForm produtos={produtos ?? []} produtoIdInicial={produtoId} sugestaoId={sugestaoId} />
    </div>
  );
}

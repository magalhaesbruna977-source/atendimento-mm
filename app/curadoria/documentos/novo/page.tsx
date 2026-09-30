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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-mm-text">Novo documento</h1>
      <NovoDocumentoForm produtos={produtos ?? []} produtoIdInicial={produtoId} sugestaoId={sugestaoId} />
    </div>
  );
}

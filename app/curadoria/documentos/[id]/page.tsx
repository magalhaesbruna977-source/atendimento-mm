import { notFound } from "next/navigation";
import { requireAdminOuRedirecionar } from "@/lib/auth/admin";
import EditarDocumentoForm from "./editar-documento-form";

interface DocumentoDetalhado {
  id: string;
  titulo: string;
  conteudo_bruto: string | null;
  tipo_arquivo: string;
  produto: { nome: string } | null;
}

export default async function EditarDocumentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sugestaoId?: string }>;
}) {
  const { supabase } = await requireAdminOuRedirecionar();
  const { id } = await params;
  const { sugestaoId } = await searchParams;

  const { data, error } = await supabase
    .from("documents")
    .select("id, titulo, conteudo_bruto, tipo_arquivo, produto:products ( nome )")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const documento = data as unknown as DocumentoDetalhado;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {documento.titulo}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {documento.produto?.nome ?? "Sem produto"} · {documento.tipo_arquivo}
        </p>
      </div>

      <EditarDocumentoForm
        documentId={documento.id}
        conteudoInicial={documento.conteudo_bruto ?? ""}
        sugestaoId={sugestaoId}
      />
    </div>
  );
}

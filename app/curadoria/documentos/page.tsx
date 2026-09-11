import Link from "next/link";
import { requireAdminOuRedirecionar } from "@/lib/auth/admin";
import ExcluirDocumentoButton from "./excluir-documento-button";

interface DocumentoComProduto {
  id: string;
  titulo: string;
  tipo_arquivo: string;
  criado_em: string;
  product_id: string;
  produto: { nome: string } | null;
}

export default async function DocumentosPage() {
  const { supabase } = await requireAdminOuRedirecionar();

  const { data, error } = await supabase
    .from("documents")
    .select("id, titulo, tipo_arquivo, criado_em, product_id, produto:products ( nome )")
    .order("criado_em", { ascending: false });

  if (error) {
    return <p className="text-red-600 dark:text-red-400">Erro ao carregar documentos: {error.message}</p>;
  }

  const documentos = (data ?? []) as unknown as DocumentoComProduto[];

  // Agrupa por produto, mantendo a ordem em que cada produto apareceu.
  const porProduto = new Map<string, { nomeProduto: string; documentos: DocumentoComProduto[] }>();
  for (const documento of documentos) {
    const nomeProduto = documento.produto?.nome ?? "Sem produto";
    if (!porProduto.has(documento.product_id)) {
      porProduto.set(documento.product_id, { nomeProduto, documentos: [] });
    }
    porProduto.get(documento.product_id)!.documentos.push(documento);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Documentos ({documentos.length})
        </h1>
        <Link
          href="/curadoria/documentos/novo"
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          + Novo documento
        </Link>
      </div>

      {documentos.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Nenhum documento cadastrado ainda.</p>
      )}

      <div className="flex flex-col gap-6">
        {[...porProduto.entries()].map(([productId, grupo]) => (
          <div key={productId} className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">
              {grupo.nomeProduto}
            </h2>
            <div className="flex flex-col divide-y divide-zinc-200 rounded border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
              {grupo.documentos.map((documento) => (
                <div key={documento.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {documento.titulo}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {documento.tipo_arquivo} ·{" "}
                      {new Date(documento.criado_em).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/curadoria/documentos/${documento.id}`}
                      className="text-sm text-zinc-700 underline dark:text-zinc-300"
                    >
                      Editar
                    </Link>
                    <ExcluirDocumentoButton documentId={documento.id} titulo={documento.titulo} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

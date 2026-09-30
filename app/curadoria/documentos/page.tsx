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
    return <p className="mm-alert-error">Erro ao carregar documentos: {error.message}</p>;
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-mm-text">
          Documentos ({documentos.length})
        </h1>
        <Link
          href="/curadoria/documentos/novo"
          className="mm-btn mm-btn-primary mm-btn-sm"
        >
          + Novo documento
        </Link>
      </div>

      {documentos.length === 0 && (
        <div className="mm-callout-info text-sm">Nenhum documento cadastrado ainda.</div>
      )}

      <div className="flex flex-col gap-6">
        {[...porProduto.entries()].map(([productId, grupo]) => (
          <div key={productId} className="flex flex-col gap-2">
            <h2 className="mm-eyebrow">
              {grupo.nomeProduto}
            </h2>
            <div className="mm-card flex flex-col divide-y divide-mm-border overflow-hidden">
              {grupo.documentos.map((documento) => (
                <div key={documento.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div>
                    <p className="text-sm font-semibold text-mm-text">
                      {documento.titulo}
                    </p>
                    <p className="text-xs text-mm-text-muted">
                      {documento.tipo_arquivo} ·{" "}
                      {new Date(documento.criado_em).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Link
                      href={`/curadoria/documentos/${documento.id}`}
                      className="mm-btn mm-btn-secondary mm-btn-sm"
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

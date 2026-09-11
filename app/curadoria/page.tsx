import Link from "next/link";
import { requireAdminOuRedirecionar } from "@/lib/auth/admin";
import DescartarSugestaoButton from "./descartar-sugestao-button";

interface ChunkUsado {
  document_id?: string;
  titulo?: string;
}

interface SugestaoPendente {
  id: string;
  descricao: string;
  criado_em: string;
  document_id: string | null;
  documento: { id: string; titulo: string } | null;
  interacao: {
    pergunta: string;
    resposta: string;
    chunks_usados: ChunkUsado[] | null;
    product_id: string | null;
  } | null;
}

export default async function CuradoriaPage() {
  const { supabase } = await requireAdminOuRedirecionar();

  const { data, error } = await supabase
    .from("suggestions")
    .select(
      `id, descricao, criado_em, document_id,
       documento:documents ( id, titulo ),
       interacao:interactions ( pergunta, resposta, chunks_usados, product_id )`,
    )
    .eq("status", "pendente")
    .order("criado_em", { ascending: false });

  if (error) {
    return <p className="text-red-600 dark:text-red-400">Erro ao carregar sugestões: {error.message}</p>;
  }

  // O Supabase tipa relacionamentos aninhados de forma genérica — ajustamos
  // aqui para o formato que sabemos que vem (uma sugestão -> um documento e
  // uma interação, no máximo).
  const sugestoes = (data ?? []) as unknown as SugestaoPendente[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Sugestões pendentes ({sugestoes.length})
      </h1>

      {sugestoes.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Nenhuma sugestão pendente no momento.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {sugestoes.map((sugestao) => {
          const fontes = [
            ...new Set(
              (sugestao.interacao?.chunks_usados ?? [])
                .map((chunk) => chunk.titulo)
                .filter((titulo): titulo is string => Boolean(titulo)),
            ),
          ];

          return (
            <div
              key={sugestao.id}
              className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(sugestao.criado_em).toLocaleString("pt-BR")}
              </p>

              {sugestao.interacao ? (
                <>
                  <div>
                    <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                      Pergunta
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50">
                      {sugestao.interacao.pergunta}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                      Resposta dada
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-50">
                      {sugestao.interacao.resposta}
                    </p>
                  </div>

                  {fontes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                        Fontes usadas
                      </p>
                      <ul className="list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
                        {fontes.map((titulo) => (
                          <li key={titulo}>{titulo}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
                  Sem interação vinculada.
                </p>
              )}

              <div>
                <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Comentário do feedback
                </p>
                <p className="text-sm text-zinc-900 dark:text-zinc-50">{sugestao.descricao}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {sugestao.documento && (
                  <Link
                    href={`/curadoria/documentos/${sugestao.documento.id}?sugestaoId=${sugestao.id}`}
                    className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
                  >
                    Editar documento-fonte ({sugestao.documento.titulo})
                  </Link>
                )}
                <Link
                  href={`/curadoria/documentos/novo?sugestaoId=${sugestao.id}${
                    sugestao.interacao?.product_id
                      ? `&produtoId=${sugestao.interacao.product_id}`
                      : ""
                  }`}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Criar novo documento
                </Link>
                <DescartarSugestaoButton sugestaoId={sugestao.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

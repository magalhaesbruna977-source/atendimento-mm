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
    return <p className="mm-alert-error">Erro ao carregar sugestões: {error.message}</p>;
  }

  // O Supabase tipa relacionamentos aninhados de forma genérica — ajustamos
  // aqui para o formato que sabemos que vem (uma sugestão -> um documento e
  // uma interação, no máximo).
  const sugestoes = (data ?? []) as unknown as SugestaoPendente[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-mm-text">
          Sugestões pendentes ({sugestoes.length})
        </h1>
        <p className="text-sm text-mm-text-muted">
          Feedbacks negativos do time que podem virar correções na base de conhecimento.
        </p>
      </div>

      {sugestoes.length === 0 && (
        <div className="mm-callout-info text-sm">Nenhuma sugestão pendente no momento.</div>
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
            <div key={sugestao.id} className="mm-card flex flex-col gap-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="mm-pill mm-pill-pendente">pendente</span>
                <p className="text-xs text-mm-text-muted">
                  {new Date(sugestao.criado_em).toLocaleString("pt-BR")}
                </p>
              </div>

              {sugestao.interacao ? (
                <>
                  <div className="flex flex-col gap-1">
                    <p className="mm-eyebrow">Pergunta</p>
                    <p className="text-sm font-semibold text-mm-text">
                      {sugestao.interacao.pergunta}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="mm-eyebrow">Resposta dada</p>
                    <p className="whitespace-pre-wrap rounded-lg border border-mm-border bg-mm-bg p-3 text-sm leading-[1.65] text-mm-text">
                      {sugestao.interacao.resposta}
                    </p>
                  </div>

                  {fontes.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="mm-eyebrow">Fontes usadas</p>
                      <ul className="flex flex-wrap gap-2">
                        {fontes.map((titulo) => (
                          <li key={titulo} className="mm-pill">
                            {titulo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm italic text-mm-text-muted">Sem interação vinculada.</p>
              )}

              <div className="flex flex-col gap-1">
                <p className="mm-eyebrow">Comentário do feedback</p>
                <p className="text-sm text-mm-text">{sugestao.descricao}</p>
              </div>

              <div className="flex flex-wrap items-start gap-2 border-t border-mm-border pt-4">
                {sugestao.documento && (
                  <Link
                    href={`/curadoria/documentos/${sugestao.documento.id}?sugestaoId=${sugestao.id}`}
                    className="mm-btn mm-btn-primary mm-btn-sm"
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
                  className="mm-btn mm-btn-secondary mm-btn-sm"
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

/**
 * BUSCA (a parte "Retrieval" do RAG).
 *
 * Gera o embedding da pergunta do usuário (Voyage AI) e usa a função
 * `match_chunks` criada no banco na Fase 2 para achar os chunks mais
 * parecidos, opcionalmente filtrando por produto.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { gerarEmbeddings } from "./voyage";
import { QUANTIDADE_CHUNKS_RECUPERADOS } from "./config";

export interface ChunkRecuperado {
  id: string;
  documentId: string;
  tituloDocumento: string;
  texto: string;
  ordem: number;
  similaridade: number;
}

// Formato de cada linha retornada pela função match_chunks (Fase 2).
interface LinhaMatchChunks {
  id: string;
  document_id: string;
  product_id: string | null;
  texto: string;
  ordem: number;
  similaridade: number;
}

export async function buscarChunksRelevantes(
  supabase: SupabaseClient,
  pergunta: string,
  productId?: string | null,
): Promise<ChunkRecuperado[]> {
  const [embeddingDaPergunta] = await gerarEmbeddings([pergunta], "query");

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: embeddingDaPergunta,
    match_product_id: productId ?? null,
    match_count: QUANTIDADE_CHUNKS_RECUPERADOS,
  });

  if (error) throw error;

  const linhas = (data ?? []) as LinhaMatchChunks[];
  if (linhas.length === 0) return [];

  // match_chunks não devolve o título do documento — buscamos à parte.
  const idsDocumentos = [...new Set(linhas.map((linha) => linha.document_id))];

  const { data: documentos, error: erroDocumentos } = await supabase
    .from("documents")
    .select("id, titulo")
    .in("id", idsDocumentos);

  if (erroDocumentos) throw erroDocumentos;

  const tituloPorDocumentoId = new Map<string, string>(
    (documentos ?? []).map((documento) => [documento.id, documento.titulo as string]),
  );

  return linhas.map((linha) => ({
    id: linha.id,
    documentId: linha.document_id,
    tituloDocumento: tituloPorDocumentoId.get(linha.document_id) ?? "Documento sem título",
    texto: linha.texto,
    ordem: linha.ordem,
    similaridade: linha.similaridade,
  }));
}

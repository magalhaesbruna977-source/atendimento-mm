/**
 * Reprocessa um documento: apaga os chunks antigos e cria chunks novos
 * (com embeddings novos) a partir do texto atual do documento.
 *
 * É a mesma lógica de chunking + embedding do script de ingestão (Fase 3),
 * só que chamada direto pelo backend da aplicação (painel de curadoria,
 * Fase 6) em vez de rodar pelo terminal — por isso recebe o texto já
 * pronto, em vez de ler um arquivo do disco.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { chunkText } from "./chunk-text";
import { gerarEmbeddings } from "./voyage";

const TAMANHO_LOTE_INSERT_CHUNKS = 50;

export async function reprocessarDocumento(
  supabase: SupabaseClient,
  documentId: string,
  textoCompleto: string,
): Promise<{ totalChunks: number }> {
  // 1. Apaga os chunks antigos deste documento.
  const { error: erroDelete } = await supabase.from("chunks").delete().eq("document_id", documentId);
  if (erroDelete) throw erroDelete;

  // 2. Divide o texto (novo ou editado) em chunks.
  const pedacos = chunkText(textoCompleto);
  if (pedacos.length === 0) return { totalChunks: 0 };

  // 3. Gera os embeddings de cada chunk.
  const embeddings = await gerarEmbeddings(pedacos, "document");

  // 4. Insere os chunks novos, em lotes (como no script de ingestão).
  const linhas = pedacos.map((texto, indice) => ({
    document_id: documentId,
    texto,
    embedding: embeddings[indice],
    ordem: indice,
  }));

  for (let i = 0; i < linhas.length; i += TAMANHO_LOTE_INSERT_CHUNKS) {
    const lote = linhas.slice(i, i + TAMANHO_LOTE_INSERT_CHUNKS);
    const { error } = await supabase.from("chunks").insert(lote);
    if (error) throw error;
  }

  return { totalChunks: pedacos.length };
}

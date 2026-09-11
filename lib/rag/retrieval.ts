/**
 * BUSCA (a parte "Retrieval" do RAG).
 *
 * Aqui vai a lógica que, a partir da pergunta do usuário, procura os
 * trechos mais relevantes na base de conhecimento (provavelmente usando
 * busca por similaridade de embeddings no Supabase, via extensão pgvector,
 * e a API da Voyage AI para gerar os embeddings — daí a variável
 * VOYAGE_API_KEY em .env.local.example).
 *
 * Por enquanto é só a assinatura da função, sem implementação:
 * nenhuma lógica de negócio foi adicionada nesta etapa do projeto.
 */

export interface KnowledgeChunk {
  id: string;
  content: string;
  source: string;
}

export async function searchKnowledgeBase(
  question: string,
): Promise<KnowledgeChunk[]> {
  throw new Error("searchKnowledgeBase ainda não foi implementada.");
}

/**
 * Ponto de entrada da lógica de RAG (Retrieval-Augmented Generation).
 *
 * Reúne as duas etapas do fluxo:
 *   1. retrieval.ts -> busca os trechos relevantes na base de conhecimento
 *   2. generation.ts -> usa a API do Claude para redigir a resposta final
 *
 * As rotas de API (em app/api/**) devem importar apenas deste arquivo,
 * e não diretamente de retrieval.ts / generation.ts.
 */
export * from "./config";
export * from "./retrieval";
export * from "./generation";

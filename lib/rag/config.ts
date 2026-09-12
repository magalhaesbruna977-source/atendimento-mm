/**
 * Configurações do fluxo de perguntas e respostas (RAG) que fazem sentido
 * ajustar depois, sem mexer na lógica em si. Tudo em um único lugar.
 */

// Quantos chunks a busca por similaridade traz de volta.
export const QUANTIDADE_CHUNKS_RECUPERADOS = 8;

// Modelo do Claude usado para redigir a resposta final.
export const MODELO_RESPOSTA = "claude-sonnet-5";

/**
 * LIMIAR DE SIMILARIDADE MÍNIMA (0 a 1).
 *
 * Se o melhor chunk encontrado na base tiver similaridade MENOR que este
 * valor, entendemos que a base não tem informação relevante o bastante
 * para essa pergunta — devolvemos a resposta padrão de "não encontrado"
 * abaixo, SEM gastar uma chamada à API do Claude.
 *
 * Para ajustar: mude só o número aqui embaixo (0.3 = 30% de parecença).
 * Quanto MAIOR o número, mais rigoroso (mais perguntas caem no "não
 * encontrado"); quanto MENOR, mais permissivo (arrisca responder com
 * contexto pouco relacionado).
 *
 * Baixado de 0.5 para 0.3 na Fase 9, depois de testar com conteúdo real:
 * perguntas de FAQ genuinamente relevantes (ex: "tem certificado?") ficam
 * na faixa de 0.30-0.36, então 0.5 rejeitava tudo. Não existe um valor
 * que separe perfeitamente relevante de irrelevante com este modelo —
 * quem segura essa peteca é o system prompt do Claude (lib/rag/generation.ts),
 * que já é instruído a dizer que não encontrou a informação quando o
 * contexto não for suficiente, mesmo recebendo um contexto pouco relacionado.
 */
export const LIMIAR_SIMILARIDADE_MINIMA = 0.3;

export const RESPOSTA_PADRAO_NAO_ENCONTRADO =
  "Não encontrei essa informação na nossa base de conhecimento. " +
  "Encaminhe para um responsável antes de responder ao cliente.";

/**
 * GERAÇÃO (a parte "Generation" do RAG).
 *
 * Aqui vai a lógica que pega a pergunta do usuário + os trechos
 * encontrados por searchKnowledgeBase() (ver retrieval.ts) e monta a
 * chamada para a API do Claude (Anthropic), pedindo uma resposta que
 * cite as fontes usadas.
 *
 * Por enquanto é só a criação do cliente e a assinatura da função, sem
 * implementação: nenhuma lógica de negócio foi adicionada nesta etapa
 * do projeto.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { KnowledgeChunk } from "./retrieval";

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
  throw new Error(
    "Falta a variável de ambiente ANTHROPIC_API_KEY. " +
      "Copie .env.local.example para .env.local e preencha o valor.",
  );
}

export const anthropicClient = new Anthropic({ apiKey: anthropicApiKey });

// Modelo padrão a ser usado nas chamadas futuras de geração de resposta.
export const DEFAULT_MODEL = "claude-opus-5";

export async function generateAnswer(
  question: string,
  context: KnowledgeChunk[],
): Promise<string> {
  throw new Error("generateAnswer ainda não foi implementada.");
}

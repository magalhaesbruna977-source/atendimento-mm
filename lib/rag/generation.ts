/**
 * GERAÇÃO (a parte "Generation" do RAG).
 *
 * Monta o prompt com o system prompt fixo do Market Makers + os chunks
 * recuperados como contexto (cada um marcado com a fonte) + a pergunta
 * do atendente, e chama a API do Claude para redigir a resposta.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { ChunkRecuperado } from "./retrieval";
import { MODELO_RESPOSTA } from "./config";

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
  throw new Error(
    "Falta a variável de ambiente ANTHROPIC_API_KEY. " +
      "Copie .env.local.example para .env.local e preencha o valor.",
  );
}

export const anthropicClient = new Anthropic({ apiKey: anthropicApiKey });

// System prompt fixo — não deve mudar por pergunta nem por produto.
export const SYSTEM_PROMPT =
  "Você é o assistente interno de atendimento do Market Makers. Responda " +
  "SOMENTE com base nos trechos de contexto fornecidos. Nunca use " +
  "conhecimento geral sobre mercado financeiro ou sobre a Market Makers que " +
  "não esteja explicitamente nos trechos, mesmo que pareça óbvio ou " +
  "correto. Se os trechos não tiverem informação suficiente, diga " +
  "claramente que não encontrou isso na base. Responda no tom de voz Market " +
  "Makers: direto, técnico quando necessário, com opinião clara, nunca " +
  "motivacional ou de autoajuda financeira, nunca prometendo rentabilidade " +
  "ou ganho fácil. Estruture a resposta de forma que o atendente possa " +
  "repassar quase diretamente para o cliente.";

function montarMensagemUsuario(pergunta: string, chunks: ChunkRecuperado[]): string {
  const contexto = chunks
    .map(
      (chunk, indice) =>
        `[Trecho ${indice + 1} — Fonte: ${chunk.tituloDocumento}]\n${chunk.texto}`,
    )
    .join("\n\n---\n\n");

  return (
    `Trechos de contexto recuperados da base de conhecimento:\n\n${contexto}\n\n` +
    `---\n\nPergunta do atendente:\n${pergunta}`
  );
}

export async function gerarResposta(
  pergunta: string,
  chunks: ChunkRecuperado[],
): Promise<string> {
  const resposta = await anthropicClient.messages.create({
    model: MODELO_RESPOSTA,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: montarMensagemUsuario(pergunta, chunks) }],
  });

  const blocoDeTexto = resposta.content.find(
    (bloco): bloco is Anthropic.TextBlock => bloco.type === "text",
  );

  return blocoDeTexto?.text ?? "";
}

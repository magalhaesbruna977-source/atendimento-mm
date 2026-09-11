/**
 * Geração de embeddings usando a API da Voyage AI (https://docs.voyageai.com).
 *
 * Usamos chamadas HTTP diretas (fetch) em vez do pacote oficial "voyageai"
 * do npm para manter a dependência mínima e o comportamento bem visível —
 * é só uma chamada POST simples.
 *
 * Mora em lib/rag/ (em vez de dentro de scripts/ingest/) porque é usado
 * tanto pelo script de ingestão (scripts/ingest.ts) quanto pela tela de
 * perguntas — a mesma função gera o embedding tanto dos documentos quanto
 * da pergunta do usuário na hora da busca.
 */

// Se um dia quiserem trocar de modelo (ex: para o mais novo voyage-3.5,
// que também usa 1024 dimensões por padrão), basta mudar esta constante —
// não precisa mudar o schema do banco.
const MODELO_VOYAGE = "voyage-3";
const URL_EMBEDDINGS = "https://api.voyageai.com/v1/embeddings";

// Quantos textos mandamos por chamada à API (o limite da Voyage é 1000
// textos por requisição; usamos um valor bem mais conservador).
const TAMANHO_DO_LOTE = 50;

interface RespostaVoyage {
  data: { embedding: number[]; index: number }[];
  model: string;
  usage: { total_tokens: number };
}

/**
 * Gera um embedding para cada texto da lista, na mesma ordem.
 *
 * `inputType`:
 *   - "document" -> use ao indexar o conteúdo da base de conhecimento (aqui).
 *   - "query"    -> use ao gerar o embedding da pergunta do usuário, na hora
 *                   da busca (isso melhora a qualidade da busca por
 *                   similaridade — não esqueça de usar "query" lá).
 */
export async function gerarEmbeddings(
  textos: string[],
  inputType: "document" | "query" = "document",
): Promise<number[][]> {
  if (textos.length === 0) return [];

  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta a variável de ambiente VOYAGE_API_KEY. Preencha o arquivo .env.local.",
    );
  }

  const resultado: number[][] = new Array(textos.length);

  for (let inicio = 0; inicio < textos.length; inicio += TAMANHO_DO_LOTE) {
    const lote = textos.slice(inicio, inicio + TAMANHO_DO_LOTE);

    const resposta = await fetch(URL_EMBEDDINGS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODELO_VOYAGE,
        input: lote,
        input_type: inputType,
      }),
    });

    if (!resposta.ok) {
      const corpoErro = await resposta.text();
      throw new Error(
        `Erro ao chamar a API da Voyage AI (status ${resposta.status}): ${corpoErro}`,
      );
    }

    const json = (await resposta.json()) as RespostaVoyage;
    for (const item of json.data) {
      resultado[inicio + item.index] = item.embedding;
    }
  }

  return resultado;
}

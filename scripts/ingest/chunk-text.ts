/**
 * Divide um texto longo em pedaços ("chunks") de tamanho parecido, para
 * serem transformados em embeddings e guardados na tabela `chunks`.
 *
 * Estratégia:
 *   1. O texto é separado em parágrafos (uma linha em branco = novo parágrafo).
 *   2. Os parágrafos são "achatados" numa lista única de palavras, guardando
 *      em quais posições começa cada parágrafo.
 *   3. Uma janela deslizante de MIN_PALAVRAS–MAX_PALAVRAS palavras percorre
 *      essa lista. Sempre que possível, o corte é ajustado para cair bem em
 *      cima do início de um parágrafo (em vez de cortar no meio de uma frase).
 *   4. Entre um chunk e o próximo, uma fração (OVERLAP) das últimas palavras
 *      do chunk anterior é repetida no início do próximo, para não perder
 *      contexto na fronteira entre os dois.
 */

const MIN_PALAVRAS = 500;
const MAX_PALAVRAS = 800;
const OVERLAP = 0.15; // 15% de sobreposição

export interface OpcoesChunk {
  minPalavras?: number;
  maxPalavras?: number;
  overlap?: number;
}

export function chunkText(texto: string, opcoes: OpcoesChunk = {}): string[] {
  const minPalavras = opcoes.minPalavras ?? MIN_PALAVRAS;
  const maxPalavras = opcoes.maxPalavras ?? MAX_PALAVRAS;
  const overlap = opcoes.overlap ?? OVERLAP;

  const paragrafos = texto
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragrafos.length === 0) return [];

  // Achata os parágrafos em uma lista única de palavras, guardando em quais
  // índices começa cada parágrafo (para preferir cortar ali).
  const palavras: string[] = [];
  const iniciosDeParagrafo: number[] = [];
  for (const paragrafo of paragrafos) {
    iniciosDeParagrafo.push(palavras.length);
    palavras.push(...paragrafo.split(/\s+/).filter(Boolean));
  }

  const chunks: string[] = [];
  let inicio = 0;

  while (inicio < palavras.length) {
    const cortePossivel = Math.min(inicio + maxPalavras, palavras.length);
    let corte = cortePossivel;

    // Se ainda sobrar texto depois deste corte, procura o início de
    // parágrafo mais próximo dentro da faixa aceitável de tamanho.
    if (cortePossivel < palavras.length) {
      const candidatos = iniciosDeParagrafo.filter(
        (posicao) => posicao > inicio + minPalavras && posicao <= cortePossivel,
      );
      if (candidatos.length > 0) {
        corte = candidatos[candidatos.length - 1];
      }
    }

    chunks.push(palavras.slice(inicio, corte).join(" "));

    if (corte >= palavras.length) break;

    const tamanhoDaSobreposicao = Math.round((corte - inicio) * overlap);
    inicio = corte - tamanhoDaSobreposicao;
  }

  return chunks;
}

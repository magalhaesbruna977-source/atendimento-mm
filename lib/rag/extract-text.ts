/**
 * Extração de texto dos arquivos da base de conhecimento.
 * Cada formato de arquivo usa uma biblioteca diferente:
 *   - .pdf  -> pdf-parse
 *   - .docx -> mammoth
 *   - .html -> html-to-text (remove as tags, deixa só o texto legível)
 *   - .md   -> leitura direta (markdown já é texto puro)
 *   - .txt  -> leitura direta (já é texto puro)
 *
 * Mora em lib/rag/ (em vez de scripts/ingest/) porque tanto o script de
 * ingestão (Fase 3) quanto o painel de curadoria (Fase 6, upload de novo
 * documento) precisam extrair texto de arquivos.
 */
import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { convert as htmlParaTexto } from "html-to-text";

export type TipoArquivo = "pdf" | "docx" | "html" | "md" | "txt";

// Extensões de arquivo aceitas pelo script, e o "tipo_arquivo" correspondente
// gravado na tabela documents (a coluna já aceita todos estes valores).
export const EXTENSOES_SUPORTADAS: Record<string, TipoArquivo> = {
  ".pdf": "pdf",
  ".docx": "docx",
  ".html": "html",
  ".htm": "html",
  ".md": "md",
  ".txt": "txt",
};

// Os únicos caracteres de controle que fazem sentido manter num texto.
const CONTROLES_PERMITIDOS = new Set(["\t", "\n", "\r"]);

/**
 * Remove caracteres de controle que o Postgres não aceita numa coluna de
 * texto. O caso descoberto na prática: alguns PDFs (dependendo da fonte
 * ou codificação interna usada) fazem o pdf-parse extrair um caractere
 * nulo escondido no meio do texto — e o Postgres recusa esse caractere
 * em colunas de texto, fazendo o insert em `documents` falhar. Mantém
 * quebra de linha, tab e retorno de carro, que são caracteres de
 * controle "normais" em texto.
 *
 * `\p{Cc}` é a categoria Unicode "Control" (inclui o caractere nulo e
 * outros parecidos).
 */
function limparCaracteresInvalidos(texto: string): string {
  return texto.replace(/\p{Cc}/gu, (caractere) =>
    CONTROLES_PERMITIDOS.has(caractere) ? caractere : "",
  );
}

/**
 * Extrai o texto completo de um arquivo já lido em memória (`buffer`).
 * `filePath` é usado só para descobrir a extensão do arquivo.
 */
export async function extrairTexto(filePath: string, buffer: Buffer): Promise<string> {
  const extensao = path.extname(filePath).toLowerCase();

  switch (extensao) {
    case ".pdf": {
      const parser = new PDFParse({ data: buffer });
      try {
        const resultado = await parser.getText();
        return limparCaracteresInvalidos(resultado.text);
      } finally {
        await parser.destroy();
      }
    }
    case ".docx": {
      const resultado = await mammoth.extractRawText({ buffer });
      return limparCaracteresInvalidos(resultado.value);
    }
    case ".html":
    case ".htm": {
      // wordwrap: false -> não quebra linha artificialmente a cada N
      // caracteres; deixamos o parágrafo original inteiro numa linha só,
      // o que ajuda o chunkText (lib/rag/chunk-text.ts) a reconhecer os
      // parágrafos corretamente.
      const texto = htmlParaTexto(buffer.toString("utf-8"), { wordwrap: false });
      return limparCaracteresInvalidos(texto);
    }
    case ".md":
    case ".txt":
      return limparCaracteresInvalidos(buffer.toString("utf-8"));
    default:
      throw new Error(`Extensão de arquivo não suportada: ${extensao}`);
  }
}

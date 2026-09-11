/**
 * Extração de texto dos arquivos da base de conhecimento.
 * Cada formato de arquivo usa uma biblioteca diferente:
 *   - .pdf  -> pdf-parse
 *   - .docx -> mammoth
 *   - .txt  -> leitura direta (já é texto puro)
 *
 * Mora em lib/rag/ (em vez de scripts/ingest/) porque tanto o script de
 * ingestão (Fase 3) quanto o painel de curadoria (Fase 6, upload de novo
 * documento) precisam extrair texto de arquivos.
 */
import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export type TipoArquivo = "pdf" | "docx" | "txt";

// Extensões de arquivo aceitas pelo script, e o "tipo_arquivo" correspondente
// gravado na tabela documents.
export const EXTENSOES_SUPORTADAS: Record<string, TipoArquivo> = {
  ".pdf": "pdf",
  ".docx": "docx",
  ".txt": "txt",
};

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
        return resultado.text;
      } finally {
        await parser.destroy();
      }
    }
    case ".docx": {
      const resultado = await mammoth.extractRawText({ buffer });
      return resultado.value;
    }
    case ".txt":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Extensão de arquivo não suportada: ${extensao}`);
  }
}

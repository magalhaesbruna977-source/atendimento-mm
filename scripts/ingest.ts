/**
 * Script de ingestão da base de conhecimento.
 *
 * Uso (a partir da raiz do projeto):
 *   npm run ingest -- "CAMINHO_DA_PASTA"
 *
 * Espera uma pasta com uma subpasta por produto, cada uma contendo
 * arquivos .pdf, .docx e/ou .txt. Para cada arquivo novo (detectado pelo
 * hash do conteúdo — arquivos já processados são pulados):
 *   1. extrai o texto;
 *   2. envia o arquivo original para o Supabase Storage;
 *   3. cria um registro em `documents`;
 *   4. divide o texto em chunks e gera os embeddings (Voyage AI);
 *   5. insere os chunks na tabela `chunks`.
 *
 * IMPORTANTE: antes de rodar isso pela primeira vez, rode no SQL Editor
 * do Supabase o script de ajuste de schema descrito na explicação desta
 * fase (adiciona a coluna documents.hash_conteudo e a trava de duplicidade
 * usada para a idempotência).
 */
import { loadEnvConfig } from "@next/env";

// Precisa rodar ANTES de qualquer código que leia process.env — inclusive
// antes dos imports abaixo serem executados, por isso fica bem no topo.
loadEnvConfig(process.cwd());

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";

import { EXTENSOES_SUPORTADAS, extrairTexto } from "./ingest/extract-text";
import { chunkText } from "./ingest/chunk-text";
import { gerarEmbeddings } from "../lib/rag/voyage";
import { BUCKET_DOCUMENTOS, garantirBucket, getSupabaseAdmin } from "./ingest/supabase-admin";

const TAMANHO_LOTE_INSERT_CHUNKS = 50;

interface ResumoProduto {
  documentosNovos: number;
  documentosPulados: number;
  chunksNovos: number;
}

interface ErroArquivo {
  arquivo: string;
  mensagem: string;
}

async function main() {
  const pastaArgumento = process.argv[2];

  if (!pastaArgumento) {
    console.error(
      'Uso correto: npm run ingest -- "CAMINHO_DA_PASTA"\n' +
        'Exemplo:     npm run ingest -- "C:\\Users\\voce\\Documents\\base-de-conhecimento"',
    );
    process.exit(1);
  }

  const pastaRaiz = path.resolve(pastaArgumento);

  if (!fs.existsSync(pastaRaiz) || !fs.statSync(pastaRaiz).isDirectory()) {
    console.error(`A pasta informada não existe (ou não é uma pasta): ${pastaRaiz}`);
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();
  await garantirBucket(supabase);

  const subpastas = fs
    .readdirSync(pastaRaiz, { withFileTypes: true })
    .filter((item) => item.isDirectory());

  if (subpastas.length === 0) {
    console.warn(`Nenhuma subpasta de produto encontrada dentro de: ${pastaRaiz}`);
  }

  const resumoPorProduto = new Map<string, ResumoProduto>();
  const arquivosIgnorados: string[] = [];
  const arquivosComErro: ErroArquivo[] = [];

  for (const subpasta of subpastas) {
    const nomeProduto = subpasta.name;
    const caminhoProduto = path.join(pastaRaiz, nomeProduto);

    console.log(`\n📦 Produto: ${nomeProduto}`);

    const productId = await garantirProduto(supabase, nomeProduto);
    const resumo: ResumoProduto = { documentosNovos: 0, documentosPulados: 0, chunksNovos: 0 };
    resumoPorProduto.set(nomeProduto, resumo);

    const arquivos = fs
      .readdirSync(caminhoProduto, { withFileTypes: true })
      .filter((item) => item.isFile());

    for (const arquivo of arquivos) {
      const caminhoArquivo = path.join(caminhoProduto, arquivo.name);
      const extensao = path.extname(arquivo.name).toLowerCase();

      if (!EXTENSOES_SUPORTADAS[extensao]) {
        arquivosIgnorados.push(caminhoArquivo);
        console.log(`  ⏭️  Ignorado (formato não suportado): ${arquivo.name}`);
        continue;
      }

      try {
        await processarArquivo({
          supabase,
          productId,
          nomeProduto,
          caminhoArquivo,
          nomeArquivo: arquivo.name,
          extensao,
          resumo,
        });
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : String(erro);
        arquivosComErro.push({ arquivo: caminhoArquivo, mensagem });
        console.error(`  ❌ Erro ao processar ${arquivo.name}: ${mensagem}`);
      }
    }
  }

  imprimirResumoFinal(resumoPorProduto, arquivosIgnorados, arquivosComErro);
}

async function processarArquivo(params: {
  supabase: SupabaseClient;
  productId: string;
  nomeProduto: string;
  caminhoArquivo: string;
  nomeArquivo: string;
  extensao: string;
  resumo: ResumoProduto;
}) {
  const { supabase, productId, nomeProduto, caminhoArquivo, nomeArquivo, extensao, resumo } =
    params;

  const buffer = fs.readFileSync(caminhoArquivo);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  // Idempotência: se já existe um documento deste produto com este mesmo
  // hash de conteúdo, o arquivo já foi processado antes — pula.
  const { data: existente, error: erroBusca } = await supabase
    .from("documents")
    .select("id")
    .eq("product_id", productId)
    .eq("hash_conteudo", hash)
    .maybeSingle();

  if (erroBusca) throw erroBusca;

  if (existente) {
    resumo.documentosPulados++;
    console.log(`  ⏭️  Já processado antes (conteúdo idêntico): ${nomeArquivo}`);
    return;
  }

  console.log(`  📄 Processando: ${nomeArquivo}`);

  const texto = await extrairTexto(caminhoArquivo, buffer);

  if (!texto || texto.trim().length === 0) {
    console.warn(`     ⚠️  Não foi possível extrair texto — pulando este arquivo.`);
    return;
  }

  const pedacos = chunkText(texto);

  if (pedacos.length === 0) {
    console.warn(`     ⚠️  Texto extraído ficou vazio depois da divisão em chunks.`);
    return;
  }

  // Geramos os embeddings ANTES de criar o registro em `documents` de
  // propósito: essa é a chamada de rede mais sujeita a falhar (limite de
  // taxa, instabilidade de conexão etc.). Se ela falhar, nada foi gravado
  // no banco ainda, então rodar o script de novo tenta este arquivo do
  // zero em vez de pulá-lo (o que aconteceria se o documento já existisse
  // com o hash marcado, mas sem nenhum chunk).
  const embeddings = await gerarEmbeddings(pedacos, "document");

  const caminhoStorage = `${slugify(nomeProduto)}/${hash}-${slugify(nomeArquivo)}`;

  const { error: erroUpload } = await supabase.storage
    .from(BUCKET_DOCUMENTOS)
    .upload(caminhoStorage, buffer, { upsert: true });

  if (erroUpload) throw erroUpload;

  const tipoArquivo = EXTENSOES_SUPORTADAS[extensao];
  const titulo = path.basename(nomeArquivo, extensao);

  const { data: documento, error: erroInsercaoDoc } = await supabase
    .from("documents")
    .insert({
      product_id: productId,
      titulo,
      tipo_arquivo: tipoArquivo,
      arquivo_storage_path: caminhoStorage,
      conteudo_bruto: texto,
      hash_conteudo: hash,
    })
    .select("id")
    .single();

  if (erroInsercaoDoc) throw erroInsercaoDoc;

  const linhasChunks = pedacos.map((textoDoChunk, indice) => ({
    document_id: documento.id,
    texto: textoDoChunk,
    embedding: embeddings[indice],
    ordem: indice,
  }));

  for (let i = 0; i < linhasChunks.length; i += TAMANHO_LOTE_INSERT_CHUNKS) {
    const lote = linhasChunks.slice(i, i + TAMANHO_LOTE_INSERT_CHUNKS);
    const { error: erroInsercaoChunks } = await supabase.from("chunks").insert(lote);
    if (erroInsercaoChunks) throw erroInsercaoChunks;
  }

  resumo.documentosNovos++;
  resumo.chunksNovos += pedacos.length;

  console.log(`     -> ${pedacos.length} chunk(s) criado(s).`);
}

async function garantirProduto(supabase: SupabaseClient, nomeProduto: string): Promise<string> {
  const { data: existente, error: erroBusca } = await supabase
    .from("products")
    .select("id")
    .eq("nome", nomeProduto)
    .maybeSingle();

  if (erroBusca) throw erroBusca;
  if (existente) return existente.id;

  const { data: novoProduto, error: erroInsercao } = await supabase
    .from("products")
    .insert({ nome: nomeProduto })
    .select("id")
    .single();

  if (erroInsercao) throw erroInsercao;

  console.log(`  ✅ Produto novo criado no banco: "${nomeProduto}"`);
  return novoProduto.id;
}

/** Deixa um texto seguro para usar como nome de arquivo/pasta no Storage. */
function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function imprimirResumoFinal(
  resumoPorProduto: Map<string, ResumoProduto>,
  arquivosIgnorados: string[],
  arquivosComErro: ErroArquivo[],
) {
  console.log("\n========== RESUMO DA INGESTÃO ==========");

  let totalDocumentos = 0;
  let totalChunks = 0;

  for (const [produto, resumo] of resumoPorProduto) {
    console.log(
      `\n📦 ${produto}\n` +
        `   Documentos novos criados: ${resumo.documentosNovos}\n` +
        `   Documentos já existentes (pulados): ${resumo.documentosPulados}\n` +
        `   Chunks criados: ${resumo.chunksNovos}`,
    );
    totalDocumentos += resumo.documentosNovos;
    totalChunks += resumo.chunksNovos;
  }

  console.log(`\nTotal geral: ${totalDocumentos} documento(s) novo(s), ${totalChunks} chunk(s).`);

  if (arquivosIgnorados.length > 0) {
    console.log(`\nArquivos ignorados (formato não suportado): ${arquivosIgnorados.length}`);
    for (const arquivo of arquivosIgnorados) console.log(`   - ${arquivo}`);
  }

  if (arquivosComErro.length > 0) {
    console.log(`\nArquivos com erro durante o processamento: ${arquivosComErro.length}`);
    for (const { arquivo, mensagem } of arquivosComErro) {
      console.log(`   - ${arquivo}\n     motivo: ${mensagem}`);
    }
  }

  console.log("\n=========================================\n");
}

main().catch((erro) => {
  console.error("\n❌ Erro inesperado durante a ingestão:", erro);
  process.exit(1);
});

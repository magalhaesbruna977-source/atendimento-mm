/**
 * Rota de API: POST /api/curadoria/documentos
 *
 * Cria um documento do zero — texto colado direto ou arquivo enviado
 * (.pdf/.docx/.txt) — e já reprocessa (chunking + embeddings), igual ao
 * script de ingestão da Fase 3, só que rodando aqui no backend em vez de
 * no terminal. Se vier de uma sugestão (sugestaoId), marca ela como
 * aprovada ao final.
 */
import crypto from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin";
import { EXTENSOES_SUPORTADAS, extrairTexto } from "@/lib/rag/extract-text";
import { reprocessarDocumento } from "@/lib/rag/reprocess-document";
import { resolverSugestao } from "@/lib/curadoria/resolver-sugestao";
import { slugify } from "@/lib/utils/slugify";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { BUCKET_DOCUMENTOS, garantirBucket } from "@/lib/supabase/storage";

export async function POST(request: Request) {
  const { supabase, erro } = await requireAdminApi();
  if (erro) return erro;

  const formData = await request.formData();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  const sugestaoIdBruto = formData.get("sugestaoId");
  const sugestaoId = typeof sugestaoIdBruto === "string" && sugestaoIdBruto ? sugestaoIdBruto : null;
  const conteudoTexto = formData.get("conteudo");
  const arquivo = formData.get("arquivo");

  if (!titulo || !productId) {
    return NextResponse.json({ erro: "Informe título e produto." }, { status: 400 });
  }

  const { data: produto, error: erroProduto } = await supabase
    .from("products")
    .select("id, nome")
    .eq("id", productId)
    .maybeSingle();

  if (erroProduto || !produto) {
    return NextResponse.json({ erro: "Produto não encontrado." }, { status: 400 });
  }

  let conteudoBruto: string;
  let tipoArquivo: string;
  let arquivoStoragePath: string | null = null;

  if (arquivo instanceof File && arquivo.size > 0) {
    const extensao = path.extname(arquivo.name).toLowerCase();
    if (!EXTENSOES_SUPORTADAS[extensao]) {
      return NextResponse.json(
        { erro: `Formato de arquivo não suportado: ${extensao || "(sem extensão)"}` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await arquivo.arrayBuffer());

    try {
      conteudoBruto = await extrairTexto(arquivo.name, buffer);
    } catch (erroExtracao) {
      console.error("Erro ao extrair texto do arquivo:", erroExtracao);
      return NextResponse.json({ erro: "Erro ao ler o arquivo enviado." }, { status: 500 });
    }

    tipoArquivo = EXTENSOES_SUPORTADAS[extensao];

    // Upload usa o cliente admin (service role): o bucket de Storage não
    // tem políticas de RLS próprias configuradas, então só a service role
    // consegue escrever nele — diferente das tabelas do banco, onde o
    // cliente da sessão já basta (a política is_admin() cobre).
    const hashArquivo = crypto.createHash("sha256").update(buffer).digest("hex");
    arquivoStoragePath = `${slugify(produto.nome)}/${hashArquivo}-${slugify(arquivo.name)}`;

    try {
      await garantirBucket(supabaseAdminClient);
      const { error: erroUpload } = await supabaseAdminClient.storage
        .from(BUCKET_DOCUMENTOS)
        .upload(arquivoStoragePath, buffer, { upsert: true });
      if (erroUpload) throw erroUpload;
    } catch (erroStorage) {
      console.error("Erro ao enviar arquivo para o Storage:", erroStorage);
      return NextResponse.json({ erro: "Erro ao enviar o arquivo." }, { status: 500 });
    }
  } else if (typeof conteudoTexto === "string" && conteudoTexto.trim()) {
    conteudoBruto = conteudoTexto.trim();
    tipoArquivo = "outro";
  } else {
    return NextResponse.json({ erro: "Cole um texto ou envie um arquivo." }, { status: 400 });
  }

  const hashConteudo = crypto.createHash("sha256").update(conteudoBruto).digest("hex");

  const { data: documento, error: erroInsercao } = await supabase
    .from("documents")
    .insert({
      product_id: productId,
      titulo,
      tipo_arquivo: tipoArquivo,
      arquivo_storage_path: arquivoStoragePath,
      conteudo_bruto: conteudoBruto,
      hash_conteudo: hashConteudo,
    })
    .select("id")
    .single();

  if (erroInsercao) {
    console.error("Erro ao criar documento:", erroInsercao);
    return NextResponse.json({ erro: "Erro ao criar o documento." }, { status: 500 });
  }

  let totalChunks = 0;
  try {
    const resultado = await reprocessarDocumento(supabase, documento.id, conteudoBruto);
    totalChunks = resultado.totalChunks;
  } catch (erroReprocessamento) {
    console.error("Erro ao gerar chunks/embeddings:", erroReprocessamento);
    return NextResponse.json(
      { erro: "Documento criado, mas houve erro ao gerar os embeddings." },
      { status: 500 },
    );
  }

  if (sugestaoId) {
    try {
      await resolverSugestao(supabase, sugestaoId, "aprovado");
    } catch (erroSugestao) {
      console.error("Erro ao aprovar sugestão:", erroSugestao);
    }
  }

  return NextResponse.json({ id: documento.id, totalChunks });
}

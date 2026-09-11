/**
 * Rotas de API para um documento específico:
 *   PUT    /api/curadoria/documentos/:id -> edita o texto e reprocessa
 *   DELETE /api/curadoria/documentos/:id -> exclui o documento
 */
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin";
import { reprocessarDocumento } from "@/lib/rag/reprocess-document";
import { resolverSugestao } from "@/lib/curadoria/resolver-sugestao";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { BUCKET_DOCUMENTOS } from "@/lib/supabase/storage";

interface CorpoRequisicao {
  conteudo?: unknown;
  sugestaoId?: unknown;
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { supabase, erro } = await requireAdminApi();
  if (erro) return erro;

  const { id } = await context.params;

  let corpo: CorpoRequisicao;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  const conteudo = typeof corpo.conteudo === "string" ? corpo.conteudo.trim() : "";
  const sugestaoId = typeof corpo.sugestaoId === "string" && corpo.sugestaoId ? corpo.sugestaoId : null;

  if (!conteudo) {
    return NextResponse.json({ erro: "O texto do documento não pode ficar vazio." }, { status: 400 });
  }

  const hashConteudo = crypto.createHash("sha256").update(conteudo).digest("hex");

  const { error: erroUpdate } = await supabase
    .from("documents")
    .update({ conteudo_bruto: conteudo, hash_conteudo: hashConteudo })
    .eq("id", id);

  if (erroUpdate) {
    console.error("Erro ao atualizar documento:", erroUpdate);
    return NextResponse.json({ erro: "Erro ao salvar o documento." }, { status: 500 });
  }

  let totalChunks = 0;
  try {
    const resultado = await reprocessarDocumento(supabase, id, conteudo);
    totalChunks = resultado.totalChunks;
  } catch (erroReprocessamento) {
    console.error("Erro ao gerar chunks/embeddings:", erroReprocessamento);
    return NextResponse.json(
      { erro: "Documento salvo, mas houve erro ao gerar os novos embeddings." },
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

  return NextResponse.json({ ok: true, totalChunks });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { supabase, erro } = await requireAdminApi();
  if (erro) return erro;

  const { id } = await context.params;

  const { data: documento, error: erroBusca } = await supabase
    .from("documents")
    .select("id, arquivo_storage_path")
    .eq("id", id)
    .maybeSingle();

  if (erroBusca) {
    return NextResponse.json({ erro: "Erro ao buscar o documento." }, { status: 500 });
  }
  if (!documento) {
    return NextResponse.json({ erro: "Documento não encontrado." }, { status: 404 });
  }

  // Os chunks são apagados automaticamente (on delete cascade, Fase 2).
  const { error: erroDelete } = await supabase.from("documents").delete().eq("id", id);
  if (erroDelete) {
    console.error("Erro ao excluir documento:", erroDelete);
    return NextResponse.json({ erro: "Erro ao excluir o documento." }, { status: 500 });
  }

  // Tenta também apagar o arquivo original do Storage — usa o cliente
  // admin pelo mesmo motivo do upload (bucket sem políticas de RLS
  // próprias). Não é crítico se isso falhar (o registro no banco já foi
  // removido), então só registramos no log.
  if (documento.arquivo_storage_path) {
    const { error: erroStorage } = await supabaseAdminClient.storage
      .from(BUCKET_DOCUMENTOS)
      .remove([documento.arquivo_storage_path]);
    if (erroStorage) {
      console.error("Erro ao remover arquivo do Storage:", erroStorage);
    }
  }

  return NextResponse.json({ ok: true });
}

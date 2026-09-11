/**
 * Rota de API: POST /api/feedback
 *
 * Recebe o 👍/👎 que o atendente deu numa resposta já exibida e:
 *   1. atualiza o registro correspondente em `interactions`
 *      (feedback + comentario_feedback) — só funciona se essa interação
 *      ainda não tinha recebido feedback (evita votar duas vezes);
 *   2. se o feedback foi negativo, cria automaticamente uma sugestão de
 *      correção (`suggestions`, status "pendente") vinculada à interação.
 *
 * Não precisamos buscar o `agent_id` aqui como fazemos em /api/ask: as
 * políticas de RLS da Fase 2 já garantem que só é possível atualizar (ou
 * criar sugestão para) uma interação que pertença ao próprio agente
 * logado — se pertencer a outra pessoa, o Supabase simplesmente não acha
 * a linha, e tratamos isso como "não encontrada" abaixo.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Feedback = "positivo" | "negativo";

interface CorpoRequisicao {
  interactionId?: unknown;
  feedback?: unknown;
  comentario?: unknown;
}

export async function POST(request: Request) {
  let corpo: CorpoRequisicao;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  const interactionId = typeof corpo.interactionId === "string" ? corpo.interactionId : "";
  const feedback: Feedback | null =
    corpo.feedback === "positivo" || corpo.feedback === "negativo" ? corpo.feedback : null;
  const comentario = typeof corpo.comentario === "string" ? corpo.comentario.trim() : "";

  if (!interactionId || !feedback) {
    return NextResponse.json({ erro: "Dados de feedback inválidos." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  // O `.is("feedback", null)` é o que garante que não dá pra votar duas
  // vezes na mesma interação: se ela já tiver um feedback salvo, esta
  // atualização não encontra nenhuma linha para mudar.
  const { data: interacaoAtualizada, error: erroAtualizacao } = await supabase
    .from("interactions")
    .update({
      feedback,
      comentario_feedback: comentario || null,
    })
    .eq("id", interactionId)
    .is("feedback", null)
    .select("id")
    .maybeSingle();

  if (erroAtualizacao) {
    console.error("Erro ao atualizar feedback:", erroAtualizacao);
    return NextResponse.json({ erro: "Erro ao salvar o feedback." }, { status: 500 });
  }

  if (!interacaoAtualizada) {
    return NextResponse.json(
      {
        erro:
          "Não foi possível registrar o feedback (a interação não existe, não é sua, " +
          "ou já recebeu um feedback antes).",
      },
      { status: 409 },
    );
  }

  if (feedback === "negativo") {
    const { error: erroSugestao } = await supabase.from("suggestions").insert({
      interaction_id: interactionId,
      tipo: "correcao",
      descricao: comentario || "Feedback negativo enviado sem comentário adicional.",
      status: "pendente",
    });

    if (erroSugestao) {
      // O feedback em si já foi salvo com sucesso — não falhamos a
      // requisição por causa disso, só registramos no log do servidor.
      console.error("Erro ao criar sugestão a partir do feedback negativo:", erroSugestao);
    }
  }

  return NextResponse.json({ ok: true });
}

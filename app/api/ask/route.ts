/**
 * Rota de API: POST /api/ask
 *
 * Recebe { pergunta, productId } do frontend e:
 *   1. confirma que quem está chamando está logado e tem um perfil de
 *      agente (obrigatório para gravar em `interactions`);
 *   2. busca os chunks mais parecidos com a pergunta (lib/rag/retrieval);
 *   3. se a maior similaridade encontrada for baixa demais, devolve a
 *      resposta padrão de "não encontrado" sem chamar o Claude;
 *   4. senão, chama o Claude para redigir a resposta (lib/rag/generation);
 *   5. salva o registro completo em `interactions`;
 *   6. devolve { resposta, fontes, interactionId } para a tela — o
 *      interactionId é usado depois por POST /api/feedback.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buscarChunksRelevantes,
  gerarResposta,
  LIMIAR_SIMILARIDADE_MINIMA,
  RESPOSTA_PADRAO_NAO_ENCONTRADO,
} from "@/lib/rag";

interface CorpoRequisicao {
  pergunta?: unknown;
  productId?: unknown;
}

export async function POST(request: Request) {
  let corpo: CorpoRequisicao;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  const pergunta = typeof corpo.pergunta === "string" ? corpo.pergunta.trim() : "";
  const productId =
    typeof corpo.productId === "string" && corpo.productId.length > 0 ? corpo.productId : null;

  if (!pergunta) {
    return NextResponse.json({ erro: "Informe uma pergunta." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  // Checagem de autenticação AQUI TAMBÉM (e não só no proxy.ts) — rotas de
  // API merecem sua própria verificação, veja a explicação desta fase.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: agente, error: erroAgente } = await supabase
    .from("agents")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (erroAgente) {
    console.error("Erro ao buscar o agente:", erroAgente);
    return NextResponse.json({ erro: "Erro ao identificar o agente." }, { status: 500 });
  }

  if (!agente) {
    return NextResponse.json(
      {
        erro:
          "Seu usuário ainda não tem um perfil de agente cadastrado. " +
          "Peça para um administrador te cadastrar na tabela agents.",
      },
      { status: 403 },
    );
  }

  let chunks;
  try {
    chunks = await buscarChunksRelevantes(supabase, pergunta, productId);
  } catch (erro) {
    console.error("Erro ao buscar chunks:", erro);
    return NextResponse.json({ erro: "Erro ao buscar na base de conhecimento." }, { status: 500 });
  }

  const maiorSimilaridade = chunks.reduce((max, chunk) => Math.max(max, chunk.similaridade), 0);
  const abaixoDoLimiar = maiorSimilaridade < LIMIAR_SIMILARIDADE_MINIMA;

  let resposta: string;
  if (abaixoDoLimiar) {
    resposta = RESPOSTA_PADRAO_NAO_ENCONTRADO;
  } else {
    try {
      resposta = await gerarResposta(pergunta, chunks);
    } catch (erro) {
      console.error("Erro ao chamar a API do Claude:", erro);
      return NextResponse.json({ erro: "Erro ao gerar a resposta." }, { status: 500 });
    }
  }

  // Fontes mostradas ao atendente: só faz sentido citar fontes quando o
  // Claude realmente usou os chunks para responder.
  const fontes = abaixoDoLimiar ? [] : [...new Set(chunks.map((chunk) => chunk.tituloDocumento))];

  // Registro salvo no banco: guardamos os chunks recuperados mesmo no caso
  // de "não encontrado" — é um bom histórico para ajustar o LIMIAR depois.
  const chunksUsados = chunks.map((chunk) => ({
    chunk_id: chunk.id,
    document_id: chunk.documentId,
    titulo: chunk.tituloDocumento,
    similaridade: chunk.similaridade,
  }));

  const { data: interacaoSalva, error: erroInteracao } = await supabase
    .from("interactions")
    .insert({
      agent_id: agente.id,
      product_id: productId,
      pergunta,
      resposta,
      chunks_usados: chunksUsados,
    })
    .select("id")
    .single();

  if (erroInteracao) {
    // Não falhamos a resposta pro atendente por causa disso — só registramos
    // no log do servidor para investigar depois. Sem interactionId, a tela
    // simplesmente não mostra os botões de feedback para esta resposta.
    console.error("Falha ao salvar em interactions:", erroInteracao);
  }

  return NextResponse.json({
    resposta,
    fontes,
    abaixoDoLimiar,
    interactionId: interacaoSalva?.id ?? null,
  });
}

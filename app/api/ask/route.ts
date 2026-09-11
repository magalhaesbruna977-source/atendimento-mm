/**
 * Rota de API: POST /api/ask
 *
 * É aqui que, no futuro, o frontend vai enviar a pergunta do time de
 * atendimento e receber de volta a resposta gerada pelo RAG (busca na
 * base de conhecimento + geração com a API do Claude).
 *
 * Por enquanto é só o esqueleto da rota — sem lógica de negócio.
 */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json(
    { error: "Rota ainda não implementada." },
    { status: 501 },
  );
}

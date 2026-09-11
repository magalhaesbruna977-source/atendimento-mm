/**
 * Rota de API: POST /api/curadoria/sugestoes/:id/resolver
 *
 * Marca uma suggestion como 'aprovado' ou 'rejeitado'. Usada tanto pelo
 * botão "Descartar sem alterar" (rejeitado) quanto automaticamente pelas
 * rotas de criar/editar documento, quando a edição partiu de uma sugestão
 * (aprovado).
 */
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin";
import { resolverSugestao } from "@/lib/curadoria/resolver-sugestao";

interface CorpoRequisicao {
  status?: unknown;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { supabase, erro } = await requireAdminApi();
  if (erro) return erro;

  const { id } = await context.params;

  let corpo: CorpoRequisicao;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  const status = corpo.status === "aprovado" || corpo.status === "rejeitado" ? corpo.status : null;

  if (!status) {
    return NextResponse.json(
      { erro: "status deve ser 'aprovado' ou 'rejeitado'." },
      { status: 400 },
    );
  }

  try {
    await resolverSugestao(supabase, id, status);
  } catch (erroResolucao) {
    console.error("Erro ao resolver sugestão:", erroResolucao);
    return NextResponse.json({ erro: "Erro ao atualizar a sugestão." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

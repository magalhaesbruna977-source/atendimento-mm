/**
 * Marca uma suggestion como 'aprovado' ou 'rejeitado' e registra
 * resolvido_em. Usado tanto pela rota de "descartar sugestão" quanto
 * automaticamente depois de editar/criar um documento a partir dela.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolverSugestao(
  supabase: SupabaseClient,
  sugestaoId: string,
  status: "aprovado" | "rejeitado",
): Promise<void> {
  const { error } = await supabase
    .from("suggestions")
    .update({ status, resolvido_em: new Date().toISOString() })
    .eq("id", sugestaoId);

  if (error) throw error;
}

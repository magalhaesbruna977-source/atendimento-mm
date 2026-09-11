/**
 * Confere se quem está logado tem is_admin = true na tabela agents.
 * Usado para proteger tudo que está debaixo de /curadoria.
 *
 * Duas versões, porque páginas e rotas de API precisam reagir de jeitos
 * diferentes quando o acesso é negado:
 *   - requireAdminOuRedirecionar(): usada em Server Components (páginas)
 *     — redireciona para /login ou /acesso-negado.
 *   - requireAdminApi(): usada em Route Handlers (rotas de API) — devolve
 *     uma resposta JSON de erro (401/403) em vez de redirecionar.
 *
 * Ambas devolvem também o cliente Supabase (já ligado à sessão do
 * agente) usado para a checagem, para quem chamar não precisar criar
 * outro cliente na sequência. A busca em si fica dentro de `cache()` do
 * React: como o layout de /curadoria já chama isso, e cada página chama
 * de novo, o `cache()` evita repetir a mesma consulta duas vezes na
 * mesma requisição (funciona só dentro de Server Components — não tem
 * efeito em Route Handlers, que já são uma requisição isolada).
 */
import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AgenteAdmin {
  id: string;
  nome: string;
  is_admin: boolean;
}

const getAgenteLogado = cache(async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, agente: null as AgenteAdmin | null };
  }

  const { data: agente } = await supabase
    .from("agents")
    .select("id, nome, is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, agente: agente as AgenteAdmin | null };
});

export async function requireAdminOuRedirecionar(): Promise<{
  supabase: SupabaseClient;
  agente: AgenteAdmin;
}> {
  const { supabase, agente } = await getAgenteLogado();

  if (!agente) {
    redirect("/login");
  }
  if (!agente.is_admin) {
    redirect("/acesso-negado");
  }

  return { supabase, agente };
}

export async function requireAdminApi(): Promise<
  | { supabase: SupabaseClient; agente: AgenteAdmin; erro: null }
  | { supabase: null; agente: null; erro: NextResponse }
> {
  const { supabase, agente } = await getAgenteLogado();

  if (!agente) {
    return {
      supabase: null,
      agente: null,
      erro: NextResponse.json({ erro: "Não autenticado." }, { status: 401 }),
    };
  }
  if (!agente.is_admin) {
    return {
      supabase: null,
      agente: null,
      erro: NextResponse.json({ erro: "Acesso restrito a administradores." }, { status: 403 }),
    };
  }

  return { supabase, agente, erro: null };
}

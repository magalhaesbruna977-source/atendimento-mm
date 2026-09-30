/**
 * Busca o agente ligado ao usuário logado (e confere se é admin, para
 * proteger tudo que está debaixo de /curadoria).
 *
 * getAgenteLogado() também cuida da CRIAÇÃO AUTOMÁTICA do registro em
 * `agents` no primeiro login: se o usuário está autenticado mas ainda não
 * tem uma linha em `agents`, uma é criada aqui (is_admin = false). A
 * checagem usa o cliente da sessão (respeita RLS); a criação usa o
 * cliente admin (service role, lib/supabase/admin.ts) porque a escrita em
 * `agents` normalmente é restrita a administradores via RLS — um agente
 * novo não teria permissão para criar a própria linha.
 *
 * Duas versões para proteger /curadoria, porque páginas e rotas de API
 * precisam reagir de jeitos diferentes quando o acesso é negado:
 *   - requireAdminOuRedirecionar(): usada em Server Components (páginas)
 *     — redireciona para /login ou /acesso-negado.
 *   - requireAdminApi(): usada em Route Handlers (rotas de API) — devolve
 *     uma resposta JSON de erro (401/403) em vez de redirecionar.
 *
 * Ambas (e getAgenteLogado) devolvem também o cliente Supabase (já ligado
 * à sessão do agente) usado para a checagem, para quem chamar não
 * precisar criar outro cliente na sequência. A busca em si fica dentro de
 * `cache()` do React: como várias páginas/rotas chamam isso na mesma
 * requisição, o `cache()` evita repetir a mesma consulta várias vezes
 * (funciona só dentro de Server Components — não tem efeito em Route
 * Handlers, que já são uma requisição isolada).
 */
import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdminClient } from "@/lib/supabase/admin";

export interface AgenteAdmin {
  id: string;
  nome: string;
  is_admin: boolean;
}

export const getAgenteLogado = cache(async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, agente: null as AgenteAdmin | null };
  }

  const { data: agenteExistente } = await supabase
    .from("agents")
    .select("id, nome, is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (agenteExistente) {
    return { supabase, agente: agenteExistente as AgenteAdmin };
  }

  // Primeiro login deste usuário: ainda não existe registro em `agents`,
  // então criamos um agora (sempre não-admin — is_admin só é ligado
  // manualmente pelo painel do Supabase).
  const { data: agenteCriado, error: erroCriacao } = await supabaseAdminClient
    .from("agents")
    .insert({ user_id: user.id, nome: user.email ?? "Agente", is_admin: false })
    .select("id, nome, is_admin")
    .single();

  if (erroCriacao) {
    console.error("Erro ao criar registro em agents no primeiro login:", erroCriacao);
    return { supabase, agente: null as AgenteAdmin | null };
  }

  return { supabase, agente: agenteCriado as AgenteAdmin };
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

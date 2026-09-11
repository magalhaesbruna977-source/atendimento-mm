/**
 * Cliente Supabase "admin" (service role key) — acesso total ao banco,
 * IGNORA as regras de Row Level Security (RLS).
 *
 * Este era o conteúdo original de server.ts na Fase 1. Ele mudou de nome
 * porque agora server.ts tem outro papel: criar um cliente ligado à
 * sessão de login do agente (respeitando RLS), usado pelas páginas e
 * rotas de API. Este arquivo (admin.ts) fica reservado para tarefas que
 * realmente precisem ignorar RLS de propósito (ex.: um painel de admin
 * que apague/edite dados de qualquer agente) — ainda não é usado por
 * nenhuma rota nesta fase.
 *
 * Por isso:
 *   - NUNCA importe este arquivo em código que roda no navegador;
 *   - a variável SUPABASE_SERVICE_ROLE_KEY não tem o prefixo NEXT_PUBLIC_
 *     justamente para o Next.js não incluí-la no código enviado ao cliente.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Faltam variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). " +
      "Copie .env.local.example para .env.local e preencha os valores.",
  );
}

export const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

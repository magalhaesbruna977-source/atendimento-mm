/**
 * Cliente Supabase para uso no NAVEGADOR (client components).
 *
 * ATUALIZADO NESTA FASE: antes usava `createClient` do pacote
 * @supabase/supabase-js puro (sessão guardada em localStorage). Agora
 * usamos `createBrowserClient` do pacote @supabase/ssr, que guarda a
 * sessão de login em COOKIES em vez de localStorage — é isso que permite
 * o servidor (Server Components, Route Handlers, proxy.ts) também saber
 * quem está logado, o que precisávamos para a tela de perguntas.
 *
 * Continua usando a URL pública e a chave "anon" do Supabase — ambas
 * seguras para expor no frontend, pois o acesso aos dados é controlado
 * pelas regras de Row Level Security (RLS) configuradas no banco.
 */
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltam variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
      "Copie .env.local.example para .env.local e preencha os valores.",
  );
}

export const supabaseBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

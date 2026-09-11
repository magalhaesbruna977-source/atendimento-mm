/**
 * Cliente Supabase para uso no NAVEGADOR (client components).
 *
 * Usa a URL pública e a chave "anon" do Supabase — ambas seguras para
 * expor no frontend, pois o acesso aos dados é controlado pelas regras
 * de Row Level Security (RLS) configuradas no banco.
 *
 * Nenhuma lógica de negócio aqui ainda — apenas a criação do cliente.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltam variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
      "Copie .env.local.example para .env.local e preencha os valores.",
  );
}

export const supabaseBrowserClient = createClient(supabaseUrl, supabaseAnonKey);

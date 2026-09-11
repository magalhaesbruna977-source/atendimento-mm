/**
 * Cliente Supabase para uso no SERVIDOR (Route Handlers em app/api/**).
 *
 * Usa a "service role key", que tem acesso total ao banco e IGNORA as
 * regras de Row Level Security (RLS). Por isso:
 *   - NUNCA importe este arquivo em código que roda no navegador;
 *   - a variável SUPABASE_SERVICE_ROLE_KEY não tem o prefixo NEXT_PUBLIC_
 *     justamente para o Next.js não incluí-la no código enviado ao cliente.
 *
 * Nenhuma lógica de negócio aqui ainda — apenas a criação do cliente.
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

export const supabaseServerClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

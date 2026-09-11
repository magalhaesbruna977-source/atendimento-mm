/**
 * Cliente Supabase para uso no SERVIDOR dentro de Server Components e
 * Route Handlers (app/**), ligado à SESSÃO DE LOGIN do agente que fez a
 * requisição — ele lê o cookie de sessão, então as consultas respeitam
 * as regras de Row Level Security (RLS) como se fossem feitas pelo
 * próprio agente logado (não como admin).
 *
 * MUDOU NESTA FASE: na Fase 1, este arquivo exportava um cliente pronto
 * (`supabaseServerClient`) usando a service role key (ignora RLS). Agora
 * ele exporta uma FUNÇÃO assíncrona que cria um cliente novo a cada
 * chamada, porque precisa ler os cookies da requisição atual — e no
 * Next.js (nesta versão) a função `cookies()` é assíncrona. O cliente
 * "admin" antigo continua existindo, só que mudou de arquivo — veja
 * lib/supabase/admin.ts.
 *
 * Use sempre: `const supabase = await createSupabaseServerClient();`
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltam variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
        "Copie .env.local.example para .env.local e preencha os valores.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado de dentro de um Server Component, que não pode escrever
          // cookies diretamente — sem problema, quem cuida de renovar a
          // sessão é o proxy.ts (ver lib/supabase/middleware.ts).
        }
      },
    },
  });
}

/**
 * Cliente Supabase usado pelo script de ingestão.
 *
 * Usa a "service role key" (acesso total, ignora RLS) porque este script
 * roda na sua máquina/terminal, nunca no navegador — é o mesmo tipo de
 * cliente de lib/supabase/admin.ts, só que criado sob demanda (dentro de
 * uma função) em vez de na primeira linha do arquivo. Isso é proposital:
 * as variáveis de ambiente só são carregadas dentro de scripts/ingest.ts,
 * então nada aqui pode ler process.env fora de uma função — senão o valor
 * seria lido "cedo demais", antes de existir.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export { BUCKET_DOCUMENTOS, garantirBucket } from "../../lib/supabase/storage";

let clienteSingleton: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (clienteSingleton) return clienteSingleton;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltam variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL / " +
        "SUPABASE_SERVICE_ROLE_KEY). Preencha o arquivo .env.local.",
    );
  }

  clienteSingleton = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return clienteSingleton;
}

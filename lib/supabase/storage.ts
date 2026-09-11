/**
 * Bucket do Supabase Storage onde guardamos os arquivos originais dos
 * documentos (pdf/docx/txt). Compartilhado entre o script de ingestão
 * (Fase 3) e o painel de curadoria (Fase 6) — por isso mora em lib/ e
 * não dentro de scripts/ingest/.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET_DOCUMENTOS = "documentos-originais";

/**
 * Garante que o bucket de Storage já existe — cria automaticamente na
 * primeira vez que for chamado.
 */
export async function garantirBucket(supabase: SupabaseClient): Promise<void> {
  const { data: bucketExistente } = await supabase.storage.getBucket(BUCKET_DOCUMENTOS);
  if (bucketExistente) return;

  const { error } = await supabase.storage.createBucket(BUCKET_DOCUMENTOS, {
    public: false,
  });

  // Se outra execução criou o bucket entre o getBucket() e o createBucket()
  // acima, o Supabase retorna um erro dizendo que já existe — nesse caso
  // está tudo bem, seguimos em frente.
  if (error && !/already exists/i.test(error.message)) {
    throw error;
  }
}

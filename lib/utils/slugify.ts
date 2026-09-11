/**
 * Deixa um texto seguro para usar como nome de arquivo/pasta (ex: no
 * Supabase Storage) — remove acentos, espaços e caracteres especiais.
 *
 * Usado pelo script de ingestão (Fase 3) e pelo painel de curadoria
 * (Fase 6) ao montar o caminho de upload de um arquivo.
 */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // remove acentos
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

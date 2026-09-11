/**
 * Neste Next.js (a partir da versão 16), o arquivo que roda antes de cada
 * página/rota — antigamente chamado "middleware.ts" — foi renomeado para
 * "proxy.ts". A função faz a mesma coisa de antes, só mudou o nome do
 * arquivo e da função exportada.
 *
 * Aqui usamos isso só para uma coisa: manter a sessão de login em dia e
 * redirecionar para /login quem não estiver autenticado (ver
 * lib/supabase/middleware.ts para a lógica em si).
 */
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Roda em tudo, exceto arquivos estáticos, imagens do Next e o favicon.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

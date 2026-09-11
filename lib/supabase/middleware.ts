/**
 * Lógica usada pelo proxy.ts (na raiz do projeto) para:
 *   1. renovar automaticamente o cookie de sessão do Supabase Auth a cada
 *      requisição (senão o login expiraria mais cedo do que deveria);
 *   2. redirecionar para /login quem não estiver autenticado;
 *   3. redirecionar para "/" quem já estiver logado e tentar abrir /login.
 *
 * Fica em um arquivo separado (em vez de tudo dentro de proxy.ts) só para
 * manter o proxy.ts pequeno e fácil de ler.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltam variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) no .env.local.",
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([chave, valor]) =>
          supabaseResponse.headers.set(chave, valor),
        );
      },
    },
  });

  // IMPORTANTE: isso precisa ser chamado logo aqui — é o que efetivamente
  // renova o token de sessão quando ele está perto de expirar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const estaNaTelaDeLogin = request.nextUrl.pathname.startsWith("/login");

  if (!user && !estaNaTelaDeLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && estaNaTelaDeLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);

    if (!email.toLowerCase().endsWith("@mmakers.com.br")) {
      setErro("Use um e-mail @mmakers.com.br.");
      return;
    }

    setCarregando(true);

    const { error } = await supabaseBrowserClient.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    // router.refresh() força os Server Components (como a página inicial)
    // a buscarem de novo os dados já sabendo que agora tem login.
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mm-bg px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="mm-card flex w-full max-w-md flex-col gap-5 p-6 sm:p-10"
      >
        <div className="flex flex-col gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-mm-accent text-sm font-extrabold text-white"
          >
            MM
          </span>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-mm-text">
            Atendimento Market Makers
          </h1>
          <p className="text-sm text-mm-text-muted">Acesso exclusivo do time de atendimento.</p>
        </div>

        <label className="mm-label">
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="voce@mmakers.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mm-input"
          />
        </label>

        <label className="mm-label">
          Senha
          <input
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mm-input"
          />
        </label>

        {erro && (
          <p role="alert" className="mm-alert-error">
            {erro}
          </p>
        )}

        <button type="submit" disabled={carregando} className="mm-btn mm-btn-primary w-full">
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

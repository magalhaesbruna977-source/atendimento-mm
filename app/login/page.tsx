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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Atendimento MM
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Entre com o e-mail e senha do seu usuário Supabase.
        </p>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Senha
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

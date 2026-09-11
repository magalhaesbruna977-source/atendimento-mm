"use client";

import { useState, type FormEvent } from "react";

interface Produto {
  id: string;
  nome: string;
}

interface RespostaApi {
  resposta?: string;
  fontes?: string[];
  abaixoDoLimiar?: boolean;
  erro?: string;
}

export default function AskForm({ produtos }: { produtos: Produto[] }) {
  const [pergunta, setPergunta] = useState("");
  const [productId, setProductId] = useState(""); // "" = Todos
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespostaApi | null>(null);

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setResultado(null);
    setCarregando(true);

    try {
      const resposta = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta, productId: productId || null }),
      });

      const dados: RespostaApi = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro ?? "Ocorreu um erro ao processar a pergunta.");
        return;
      }

      setResultado(dados);
    } catch {
      setErro("Não foi possível falar com o servidor. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Tópico (produto)
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">Todos</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Pergunta
          <textarea
            required
            rows={4}
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Digite a dúvida do cliente..."
            className="resize-none rounded border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <button
          type="submit"
          disabled={carregando}
          className="self-start rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {carregando ? "Buscando..." : "Enviar"}
        </button>
      </form>

      {erro && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {erro}
        </p>
      )}

      {resultado?.resposta && (
        <div className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-50">
            {resultado.resposta}
          </p>

          {!resultado.abaixoDoLimiar && resultado.fontes && resultado.fontes.length > 0 && (
            <details className="text-sm text-zinc-600 dark:text-zinc-400">
              <summary className="cursor-pointer font-medium">
                Fontes usadas ({resultado.fontes.length})
              </summary>
              <ul className="mt-2 list-inside list-disc">
                {resultado.fontes.map((fonte) => (
                  <li key={fonte}>{fonte}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditarDocumentoForm({
  documentId,
  conteudoInicial,
  sugestaoId,
}: {
  documentId: string;
  conteudoInicial: string;
  sugestaoId?: string;
}) {
  const router = useRouter();
  const [conteudo, setConteudo] = useState(conteudoInicial);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvar() {
    setErro(null);
    setMensagem(null);
    setSalvando(true);

    try {
      const resposta = await fetch(`/api/curadoria/documentos/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo, sugestaoId }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro ?? "Erro ao salvar o documento.");
        return;
      }

      setMensagem(
        `Documento salvo e reprocessado (${dados.totalChunks} chunk(s) gerado(s)).` +
          (sugestaoId ? " Sugestão marcada como aprovada." : ""),
      );
    } catch {
      setErro("Não foi possível falar com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        rows={20}
        className="w-full resize-y rounded border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSalvar}
          disabled={salvando}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {salvando ? "Salvando e reprocessando..." : "Salvar e reprocessar"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          Voltar
        </button>
      </div>

      {mensagem && <p className="text-sm text-green-700 dark:text-green-400">{mensagem}</p>}
      {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
    </div>
  );
}

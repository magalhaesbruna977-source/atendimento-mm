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
    <div className="mm-card flex flex-col gap-4 p-5 sm:p-7">
      <textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        rows={20}
        className="mm-input resize-y rounded-xl font-mono text-sm leading-relaxed"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSalvar}
          disabled={salvando}
          className="mm-btn mm-btn-primary"
        >
          {salvando ? "Salvando e reprocessando..." : "Salvar e reprocessar"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="mm-btn mm-btn-secondary"
        >
          Voltar
        </button>
      </div>

      {mensagem && <p className="mm-alert-success">{mensagem}</p>}
      {erro && (
        <p role="alert" className="mm-alert-error">
          {erro}
        </p>
      )}
    </div>
  );
}

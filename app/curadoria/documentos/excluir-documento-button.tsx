"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExcluirDocumentoButton({
  documentId,
  titulo,
}: {
  documentId: string;
  titulo: string;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm(`Excluir o documento "${titulo}"? Isso também apaga todos os chunks dele.`)) {
      return;
    }

    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/curadoria/documentos/${documentId}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados.erro ?? "Erro ao excluir o documento.");
        return;
      }

      router.refresh();
    } catch {
      setErro("Não foi possível falar com o servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={enviando}
        className="text-sm text-red-600 underline disabled:opacity-50 dark:text-red-400"
      >
        {enviando ? "Excluindo..." : "Excluir"}
      </button>
      {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DescartarSugestaoButton({ sugestaoId }: { sugestaoId: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("Descartar esta sugestão sem alterar nenhum documento?")) return;

    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/curadoria/sugestoes/${sugestaoId}/resolver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejeitado" }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados.erro ?? "Erro ao descartar a sugestão.");
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
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={enviando}
        className="mm-btn mm-btn-danger mm-btn-sm"
      >
        {enviando ? "Descartando..." : "Descartar sem alterar"}
      </button>
      {erro && <p className="text-sm font-medium text-mm-red">{erro}</p>}
    </div>
  );
}

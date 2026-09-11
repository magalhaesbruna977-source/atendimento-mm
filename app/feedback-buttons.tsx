"use client";

import { useState } from "react";

type Feedback = "positivo" | "negativo";

/**
 * Botões de 👍/👎 exibidos abaixo de uma resposta.
 *
 * Recebe o `interactionId` daquela resposta específica (devolvido por
 * POST /api/ask) e usa em POST /api/feedback. Cada instância deste
 * componente cuida do próprio estado (usamos `key={interactionId}` no
 * componente pai para garantir um componente novo — e com estado limpo —
 * a cada resposta nova).
 */
export default function FeedbackButtons({ interactionId }: { interactionId: string }) {
  const [feedbackEnviado, setFeedbackEnviado] = useState<Feedback | null>(null);
  const [mostrarComentario, setMostrarComentario] = useState(false);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarFeedback(feedback: Feedback, comentarioEnviado?: string) {
    setErro(null);
    setEnviando(true);

    try {
      const resposta = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interactionId, feedback, comentario: comentarioEnviado }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro ?? "Não foi possível enviar o feedback.");
        return;
      }

      setFeedbackEnviado(feedback);
      setMostrarComentario(false);
    } catch {
      setErro("Não foi possível falar com o servidor.");
    } finally {
      setEnviando(false);
    }
  }

  if (feedbackEnviado) {
    return <p className="text-sm text-green-700 dark:text-green-400">Obrigado pelo feedback!</p>;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Essa resposta foi útil?</span>
        <button
          type="button"
          onClick={() => enviarFeedback("positivo")}
          disabled={enviando}
          aria-label="Resposta útil"
          className="text-xl leading-none disabled:opacity-50"
        >
          👍
        </button>
        <button
          type="button"
          onClick={() => setMostrarComentario(true)}
          disabled={enviando}
          aria-label="Resposta não útil"
          className="text-xl leading-none disabled:opacity-50"
        >
          👎
        </button>
      </div>

      {mostrarComentario && (
        <div className="flex flex-col gap-2">
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="O que estava errado ou faltando? (opcional)"
            rows={2}
            className="resize-none rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => enviarFeedback("negativo", comentario.trim() || undefined)}
              disabled={enviando}
              className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {enviando ? "Enviando..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarComentario(false)}
              disabled={enviando}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
    </div>
  );
}

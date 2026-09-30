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

  // Depois de enviado, os botões continuam visíveis (desabilitados) mostrando
  // qual feedback foi dado — só muda a aparência, não dá para reenviar.
  const positivoAtivo = feedbackEnviado === "positivo";
  const negativoAtivo = feedbackEnviado === "negativo" || mostrarComentario;
  const bloqueado = enviando || feedbackEnviado !== null;

  const classeBase =
    "flex h-10 w-12 items-center justify-center rounded-lg border text-lg leading-none transition-colors disabled:cursor-not-allowed";
  const classeNeutra =
    "border-mm-border bg-mm-bg hover:enabled:bg-mm-surface-2 disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3 border-t border-mm-border pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-mm-text-muted">Essa resposta foi útil?</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => enviarFeedback("positivo")}
            disabled={bloqueado}
            aria-label="Resposta útil"
            aria-pressed={positivoAtivo}
            className={`${classeBase} ${
              positivoAtivo ? "border-mm-green bg-mm-green-tint text-mm-green" : classeNeutra
            }`}
          >
            👍
          </button>
          <button
            type="button"
            onClick={() => setMostrarComentario(true)}
            disabled={bloqueado}
            aria-label="Resposta não útil"
            aria-pressed={negativoAtivo}
            className={`${classeBase} ${
              negativoAtivo ? "border-mm-red bg-mm-red-tint text-mm-red" : classeNeutra
            }`}
          >
            👎
          </button>
        </div>
        {feedbackEnviado && (
          <span className="text-sm font-semibold text-mm-green">Obrigado pelo feedback!</span>
        )}
      </div>

      {mostrarComentario && (
        <div className="flex flex-col gap-2">
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="O que estava errado ou faltando? (opcional)"
            rows={2}
            className="mm-input resize-none text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => enviarFeedback("negativo", comentario.trim() || undefined)}
              disabled={enviando}
              className="mm-btn mm-btn-primary mm-btn-sm"
            >
              {enviando ? "Enviando..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarComentario(false)}
              disabled={enviando}
              className="mm-btn mm-btn-secondary mm-btn-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {erro && (
        <p role="alert" className="mm-alert-error">
          {erro}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import FeedbackButtons from "./feedback-buttons";

interface Produto {
  id: string;
  nome: string;
}

interface RespostaApi {
  resposta?: string;
  fontes?: string[];
  abaixoDoLimiar?: boolean;
  interactionId?: string | null;
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
    <div className="flex w-full flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span id="rotulo-topico" className="text-sm font-semibold text-mm-text">
            Tópico (produto)
          </span>
          <div
            role="radiogroup"
            aria-labelledby="rotulo-topico"
            className="flex flex-wrap gap-2 rounded-xl border border-mm-border bg-mm-surface p-2"
          >
            {[{ id: "", nome: "Todos" }, ...produtos].map((produto) => {
              const ativo = productId === produto.id;
              return (
                <button
                  key={produto.id || "todos"}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => setProductId(produto.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    ativo
                      ? "border-mm-accent-soft bg-mm-accent-tint text-mm-accent-deep"
                      : "border-transparent text-mm-text-muted hover:bg-mm-surface-2 hover:text-mm-text"
                  }`}
                >
                  {produto.nome}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mm-label">
          Pergunta
          <textarea
            required
            rows={5}
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Digite a dúvida do cliente..."
            className="mm-input min-h-36 resize-y rounded-xl text-base leading-relaxed"
          />
        </label>

        <button
          type="submit"
          disabled={carregando}
          className="mm-btn mm-btn-primary w-full sm:w-auto sm:self-start"
        >
          {carregando ? "Buscando..." : "Enviar pergunta"}
        </button>
      </form>

      {erro && (
        <p role="alert" className="mm-alert-error">
          {erro}
        </p>
      )}

      {resultado?.resposta && (
        <div className="mm-card flex flex-col gap-5 p-5 sm:p-7">
          {resultado.abaixoDoLimiar ? (
            <div className="mm-callout-info flex flex-col gap-1">
              <p className="text-sm font-bold text-mm-accent-deep">Não encontrado na base</p>
              <p className="whitespace-pre-wrap text-[0.9375rem] leading-[1.65]">
                {resultado.resposta}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="mm-eyebrow">Resposta</p>
              <p className="whitespace-pre-wrap text-[0.9375rem] leading-[1.65] text-mm-text">
                {resultado.resposta}
              </p>
            </div>
          )}

          {!resultado.abaixoDoLimiar && resultado.fontes && resultado.fontes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="mm-eyebrow">Fontes usadas ({resultado.fontes.length})</p>
              <ul className="flex flex-wrap gap-2">
                {resultado.fontes.map((fonte) => (
                  <li
                    key={fonte}
                    title={fonte}
                    className="mm-pill max-w-full truncate transition-colors hover:bg-mm-accent-tint hover:text-mm-accent-deep"
                  >
                    {fonte}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resultado.interactionId && (
            <FeedbackButtons key={resultado.interactionId} interactionId={resultado.interactionId} />
          )}
        </div>
      )}
    </div>
  );
}

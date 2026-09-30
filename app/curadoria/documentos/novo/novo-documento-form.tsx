"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Produto {
  id: string;
  nome: string;
}

export default function NovoDocumentoForm({
  produtos,
  produtoIdInicial,
  sugestaoId,
}: {
  produtos: Produto[];
  produtoIdInicial?: string;
  sugestaoId?: string;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [productId, setProductId] = useState(produtoIdInicial ?? "");
  const [modo, setModo] = useState<"texto" | "arquivo">("texto");
  const [conteudo, setConteudo] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);

    if (!productId) {
      setErro("Escolha um produto.");
      return;
    }
    if (modo === "texto" && !conteudo.trim()) {
      setErro("Cole o texto do documento.");
      return;
    }
    if (modo === "arquivo" && !arquivo) {
      setErro("Selecione um arquivo.");
      return;
    }

    setEnviando(true);

    const formData = new FormData();
    formData.set("titulo", titulo);
    formData.set("productId", productId);
    if (sugestaoId) formData.set("sugestaoId", sugestaoId);
    if (modo === "texto") {
      formData.set("conteudo", conteudo);
    } else if (arquivo) {
      formData.set("arquivo", arquivo);
    }

    try {
      const resposta = await fetch("/api/curadoria/documentos", {
        method: "POST",
        body: formData,
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro ?? "Erro ao criar o documento.");
        return;
      }

      // Se veio de uma sugestão, ela já foi aprovada — volta pra lista de
      // sugestões pendentes; senão, volta pra lista geral de documentos.
      router.push(sugestaoId ? "/curadoria" : "/curadoria/documentos");
      router.refresh();
    } catch {
      setErro("Não foi possível falar com o servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mm-card flex flex-col gap-5 p-5 sm:p-7">
      <label className="mm-label">
        Título
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mm-input"
        />
      </label>

      <label className="mm-label">
        Produto
        <select
          required
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="mm-input"
        >
          <option value="">Selecione...</option>
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.nome}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-3 text-sm text-mm-text sm:flex-row sm:gap-6">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="modo"
            checked={modo === "texto"}
            onChange={() => setModo("texto")}
            className="accent-mm-accent"
          />
          Colar texto
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="modo"
            checked={modo === "arquivo"}
            onChange={() => setModo("arquivo")}
            className="accent-mm-accent"
          />
          Enviar arquivo (.pdf, .docx, .html, .md, .txt)
        </label>
      </div>

      {modo === "texto" ? (
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={14}
          placeholder="Cole aqui o texto do documento..."
          className="mm-input resize-y rounded-xl font-mono text-sm leading-relaxed"
        />
      ) : (
        <input
          type="file"
          accept=".pdf,.docx,.html,.htm,.md,.txt"
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          className="mm-input text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-mm-accent-tint file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-mm-accent-deep"
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="mm-btn mm-btn-primary"
        >
          {enviando ? "Salvando..." : "Criar documento"}
        </button>
      </div>

      {erro && (
        <p role="alert" className="mm-alert-error">
          {erro}
        </p>
      )}
    </form>
  );
}

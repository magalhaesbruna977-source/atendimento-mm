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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Título
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Produto
        <select
          required
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="">Selecione...</option>
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.nome}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-4 text-sm text-zinc-700 dark:text-zinc-300">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="modo"
            checked={modo === "texto"}
            onChange={() => setModo("texto")}
          />
          Colar texto
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="modo"
            checked={modo === "arquivo"}
            onChange={() => setModo("arquivo")}
          />
          Enviar arquivo (.pdf, .docx, .txt)
        </label>
      </div>

      {modo === "texto" ? (
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={14}
          placeholder="Cole aqui o texto do documento..."
          className="resize-y rounded border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      ) : (
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          className="text-sm text-zinc-700 dark:text-zinc-300"
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {enviando ? "Salvando..." : "Criar documento"}
        </button>
      </div>

      {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
    </form>
  );
}

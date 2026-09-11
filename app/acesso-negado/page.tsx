import Link from "next/link";

export default function AcessoNegadoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Acesso restrito</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Essa página é só para administradores. Se você acha que deveria ter acesso, peça para um
        administrador marcar <code>is_admin = true</code> no seu cadastro (tabela{" "}
        <code>agents</code>).
      </p>
      <Link href="/" className="text-sm text-zinc-900 underline dark:text-zinc-50">
        Voltar para a tela de perguntas
      </Link>
    </div>
  );
}

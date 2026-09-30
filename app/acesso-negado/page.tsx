import Link from "next/link";

export default function AcessoNegadoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mm-bg px-4 py-10">
      <div className="mm-card flex w-full max-w-md flex-col items-center gap-4 p-6 text-center sm:p-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-mm-text">Acesso restrito</h1>
        <p className="text-sm leading-relaxed text-mm-text-muted">
          Essa página é só para administradores. Se você acha que deveria ter acesso, peça para um
          administrador marcar <code>is_admin = true</code> no seu cadastro (tabela{" "}
          <code>agents</code>).
        </p>
        <Link href="/" className="mm-btn mm-btn-primary">
          Voltar para a tela de perguntas
        </Link>
      </div>
    </div>
  );
}

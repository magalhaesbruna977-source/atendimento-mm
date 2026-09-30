import type { Metadata } from "next";
import { getAgenteLogado } from "@/lib/auth/admin";
import SiteHeader from "../site-header";
import CentralConhecimento from "./central-conhecimento";

export const metadata: Metadata = {
  title: "Central de Conhecimento · Atendimento MM",
};

export default async function MaterialDeApoioPage() {
  // A rota já é protegida pelo proxy.ts (sem login → /login); aqui só
  // precisamos saber se é admin para mostrar o link de Curadoria no menu.
  const { agente } = await getAgenteLogado();

  return (
    <div className="flex min-h-screen flex-col bg-mm-bg">
      <SiteHeader isAdmin={Boolean(agente?.is_admin)} />
      <CentralConhecimento />
    </div>
  );
}

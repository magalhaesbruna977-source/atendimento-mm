import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AskForm from "./ask-form";
import LogoutButton from "./logout-button";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: produtos }, { data: agente }] = await Promise.all([
    supabase.from("products").select("id, nome").order("nome"),
    user
      ? supabase.from("agents").select("is_admin").eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <div className="flex w-full max-w-2xl items-center justify-between pb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Atendimento MM
        </h1>
        <div className="flex items-center gap-4">
          {agente?.is_admin && (
            <Link
              href="/curadoria"
              className="text-sm text-zinc-600 underline dark:text-zinc-400"
            >
              Curadoria
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <AskForm produtos={produtos ?? []} />
    </div>
  );
}

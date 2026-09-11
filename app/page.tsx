import { createSupabaseServerClient } from "@/lib/supabase/server";
import AskForm from "./ask-form";
import LogoutButton from "./logout-button";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const { data: produtos } = await supabase
    .from("products")
    .select("id, nome")
    .order("nome");

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <div className="flex w-full max-w-2xl items-center justify-between pb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Atendimento MM
        </h1>
        <LogoutButton />
      </div>

      <AskForm produtos={produtos ?? []} />
    </div>
  );
}

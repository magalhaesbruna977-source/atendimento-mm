"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleClick() {
    await supabaseBrowserClient.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
    >
      Sair
    </button>
  );
}

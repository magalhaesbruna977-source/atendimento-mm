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
      className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-mm-text-muted transition-colors hover:bg-mm-surface hover:text-mm-red"
    >
      Sair
    </button>
  );
}

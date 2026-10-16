"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="inline-flex items-center rounded-full border border-white/10 p-2 text-zinc-400 transition hover:border-white/20 hover:text-white"
      aria-label="Log out"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}

import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = data?.username ?? null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          Vibe Share
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/upload"
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-glow transition hover:bg-violet-500"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </Link>
              <Link
                href="/profile"
                className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-violet-400/40 hover:text-white"
              >
                {username ? `@${username}` : "Dashboard"}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-sm text-zinc-300 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

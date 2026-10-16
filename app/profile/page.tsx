import { redirect } from "next/navigation";
import { ProfileDashboard } from "@/components/profile-dashboard";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const [{ data: profile }, { data: posts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.2em] text-violet-300">Studio</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        @{profile?.username ?? "you"}
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Edit titles, descriptions, and categories, or delete posts from your library.
      </p>
      <div className="mt-8">
        <ProfileDashboard posts={(posts as Post[] | null) ?? []} />
      </div>
    </div>
  );
}

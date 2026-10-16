import { notFound } from "next/navigation";
import { DiscoveryFeed } from "@/components/discovery-feed";
import { createClient } from "@/lib/supabase/server";
import type { PostWithMeta } from "@/lib/types";

type Props = { params: Promise<{ username: string }> };

export default async function CreatorPage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const { data } = await supabase
    .from("posts")
    .select("*, profiles(id, username, avatar_url), likes(count), comments(count)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.2em] text-violet-300">Creator</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">@{profile.username}</h1>
      {profile.bio && <p className="mt-2 max-w-xl text-sm text-zinc-400">{profile.bio}</p>}
      <div className="mt-8">
        <DiscoveryFeed posts={(data as PostWithMeta[] | null) ?? []} />
      </div>
    </div>
  );
}

import { DiscoveryFeed } from "@/components/discovery-feed";
import { createClient } from "@/lib/supabase/server";
import type { PostWithMeta } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_user_id_fkey(id, username, avatar_url), likes(count), comments(count)")
    .order("created_at", { ascending: false });

  const posts = (error ? [] : (data as PostWithMeta[] | null)) ?? [];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-violet-300">Discover</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          What creators are dropping
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Images, short clips, and text posts from the community. Filter by vibe or search a title.
        </p>
      </div>
      {error && (
        <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Database Error: <code className="text-amber-100">{error.message} ({error.code})</code>
        </p>
      )}
      <DiscoveryFeed posts={posts} />
    </div>
  );
}

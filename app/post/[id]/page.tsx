import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { CommentSection } from "@/components/comment-section";
import { LikeButton } from "@/components/like-button";
import { createClient } from "@/lib/supabase/server";
import type { CommentWithAuthor, Post } from "@/lib/types";
import { formatCount, formatRelativeTime } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(id, username, avatar_url)")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  await supabase.rpc("increment_view_count", { target_post_id: id });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: likeCount }, likedRes, commentsRes] = await Promise.all([
    supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", id),
    user
      ? supabase.from("likes").select("post_id").eq("post_id", id).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("comments")
      .select("*, profiles(id, username, avatar_url)")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const typed = post as Post & {
    profiles: { id: string; username: string; avatar_url: string | null } | null;
  };
  const username = typed.profiles?.username ?? "unknown";
  const comments = (commentsRes.data as CommentWithAuthor[] | null) ?? [];

  return (
    <article className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">
        {typed.media_type === "image" && typed.media_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={typed.media_url} alt={typed.title} className="w-full object-contain" />
        )}
        {typed.media_type === "video" && typed.media_url && (
          <video src={typed.media_url} controls playsInline className="w-full bg-black" />
        )}
        {typed.media_type === "text" && (
          <div className="bg-gradient-to-br from-violet-950 to-zinc-900 p-8 text-lg leading-relaxed text-zinc-100">
            {typed.description}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs uppercase tracking-wide text-violet-300">
            {typed.category}
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{typed.title}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            by{" "}
            <Link href={`/creator/${username}`} className="text-violet-300 hover:text-violet-200">
              @{username}
            </Link>{" "}
            · {formatRelativeTime(typed.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LikeButton
            postId={typed.id}
            userId={user?.id ?? null}
            initialCount={likeCount ?? 0}
            initiallyLiked={Boolean(likedRes.data)}
          />
          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
            <Eye className="h-4 w-4" />
            {formatCount((typed.view_count ?? 0) + 1)}
          </span>
        </div>
      </div>

      {typed.media_type !== "text" && typed.description && (
        <p className="mt-6 whitespace-pre-wrap text-zinc-300">{typed.description}</p>
      )}

      <CommentSection postId={typed.id} userId={user?.id ?? null} comments={comments} />
    </article>
  );
}

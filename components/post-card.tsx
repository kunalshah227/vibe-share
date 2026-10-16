import Link from "next/link";
import { Eye, Heart, Type } from "lucide-react";
import type { PostWithMeta } from "@/lib/types";
import { formatCount, formatRelativeTime, likeCountFromEmbed } from "@/lib/utils";

export function PostCard({ post }: { post: PostWithMeta }) {
  const likes = likeCountFromEmbed(post.likes);
  const username = post.profiles?.username ?? "unknown";

  return (
    <article className="masonry-item overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 transition hover:border-violet-500/40 hover:shadow-glow">
      <Link href={`/post/${post.id}`} className="block">
        {post.media_type === "image" && post.media_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.media_url} alt={post.title} className="h-auto w-full object-cover" />
        ) : post.media_type === "video" && post.media_url ? (
          <video
            src={post.media_url}
            muted
            playsInline
            preload="metadata"
            className="h-auto w-full bg-black object-cover"
          />
        ) : (
          <div className="flex min-h-40 flex-col justify-between bg-gradient-to-br from-violet-950/80 to-zinc-900 p-5">
            <Type className="h-5 w-5 text-violet-300" />
            <p className="mt-4 line-clamp-5 text-sm text-zinc-200">{post.description}</p>
          </div>
        )}
        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-violet-300">
              {post.category}
            </span>
            <span className="text-xs text-zinc-500">{formatRelativeTime(post.created_at)}</span>
          </div>
          <h2 className="text-base font-semibold leading-snug">{post.title}</h2>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>@{username}</span>
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {formatCount(likes)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {formatCount(post.view_count)}
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

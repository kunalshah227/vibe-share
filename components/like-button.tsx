"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCount } from "@/lib/utils";

type Props = {
  postId: string;
  userId: string | null;
  initialCount: number;
  initiallyLiked: boolean;
};

export function LikeButton({ postId, userId, initialCount, initiallyLiked }: Props) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!userId || busy) {
      if (!userId) window.location.href = `/login?next=/post/${postId}`;
      return;
    }

    setBusy(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    const supabase = createClient();
    if (nextLiked) {
      const { error } = await supabase.from("likes").insert({ user_id: userId, post_id: postId });
      if (error) {
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);
      if (error) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
        liked
          ? "border-pink-400/40 bg-pink-500/15 text-pink-300"
          : "border-white/10 text-zinc-300 hover:border-pink-400/30",
      )}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      {formatCount(count)}
    </button>
  );
}

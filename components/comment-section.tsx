"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import type { CommentWithAuthor } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";

type Props = {
  postId: string;
  userId: string | null;
  comments: CommentWithAuthor[];
};

export function CommentSection({ postId, userId, comments }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      window.location.href = `/login?next=/post/${postId}`;
      return;
    }
    if (!body.trim()) return;

    setSending(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: userId,
      body: body.trim(),
    });
    setSending(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={userId ? "Add a comment..." : "Log in to comment"}
          className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center rounded-xl bg-violet-600 px-3 py-2 text-white hover:bg-violet-500 disabled:opacity-60"
          aria-label="Send comment"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      <ul className="mt-6 space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-xl border border-white/5 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <Link
                href={`/creator/${comment.profiles?.username ?? comment.user_id}`}
                className="font-medium text-violet-300 hover:text-violet-200"
              >
                @{comment.profiles?.username ?? "user"}
              </Link>
              <span>{formatRelativeTime(comment.created_at)}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-200">{comment.body}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-zinc-500">No comments yet. Start the thread.</li>
        )}
      </ul>
    </section>
  );
}

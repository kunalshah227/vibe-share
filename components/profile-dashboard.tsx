"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import type { Post } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";

export function ProfileDashboard({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEdit(post: Post) {
    setEditing(post);
    setTitle(post.title);
    setDescription(post.description ?? "");
    setCategory(post.category);
    setError(null);
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        category,
      })
      .eq("id", editing.id);
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(post: Post) {
    if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    const supabase = createClient();
    if (post.storage_path) {
      await supabase.storage.from("media").remove([post.storage_path]);
    }
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", post.id);
    if (deleteError) {
      alert(deleteError.message);
      return;
    }
    router.refresh();
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
        <p className="text-zinc-400">You have not posted anything yet.</p>
        <Link href="/upload" className="mt-4 inline-block text-sm text-violet-300 hover:text-violet-200">
          Upload your first piece
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60"
          >
            <Link href={`/post/${post.id}`}>
              {post.media_type === "image" && post.media_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.media_url} alt={post.title} className="h-40 w-full object-cover" />
              ) : post.media_type === "video" && post.media_url ? (
                <video src={post.media_url} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center bg-violet-950/50 p-4 text-sm text-zinc-300">
                  <p className="line-clamp-4">{post.description}</p>
                </div>
              )}
            </Link>
            <div className="p-4">
              <h2 className="font-medium">{post.title}</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {post.category} · {formatRelativeTime(post.created_at)}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(post)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(post)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-glow">
            <h3 className="text-lg font-semibold">Edit post</h3>
            <div className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm"
              />
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {error && <p className="text-sm text-red-300">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl px-3 py-2 text-sm text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={save}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

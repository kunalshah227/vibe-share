"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileVideo, ImageIcon, Loader2, Type, Upload } from "lucide-react";
import { ACCEPTED_TYPES, CATEGORIES, MAX_FILE_BYTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { MediaType } from "@/lib/types";
import { cn } from "@/lib/utils";

function mediaTypeFromFile(file: File): Exclude<MediaType, "text"> {
  return file.type.startsWith("video/") ? "video" : "image";
}

function uploadWithProgress(options: {
  supabaseUrl: string;
  accessToken: string;
  anonKey: string;
  path: string;
  file: File;
  onProgress: (pct: number) => void;
}) {
  const { supabaseUrl, accessToken, anonKey, path, file, onProgress } = options;

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/media/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export function UploadForm({ userId }: { userId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"media" | "text">("media");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tech");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  function validateFile(next: File) {
    if (!ACCEPTED_TYPES.includes(next.type)) {
      return "Use PNG, JPG, WEBP, or MP4.";
    }
    if (next.size > MAX_FILE_BYTES) {
      return "File must be 50MB or smaller.";
    }
    return null;
  }

  function onFiles(list: FileList | null) {
    const next = list?.[0];
    if (!next) return;
    const problem = validateFile(next);
    if (problem) {
      setError(problem);
      setFile(null);
      return;
    }
    setError(null);
    setFile(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "media" && !file) {
      setError("Drop a file or choose one from disk.");
      return;
    }
    if (mode === "text" && !description.trim()) {
      setError("Write some text for this post.");
      return;
    }

    setSubmitting(true);
    setProgress(mode === "text" ? 40 : 5);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("You need to be logged in.");

      let mediaUrl: string | null = null;
      let storagePath: string | null = null;
      let mediaType: MediaType = "text";

      if (mode === "media" && file) {
        mediaType = mediaTypeFromFile(file);
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        storagePath = `${userId}/${crypto.randomUUID()}.${ext}`;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        await uploadWithProgress({
          supabaseUrl,
          accessToken: session.access_token,
          anonKey,
          path: storagePath
            .split("/")
            .map((segment) => encodeURIComponent(segment))
            .join("/"),
          file,
          onProgress: setProgress,
        });

        const { data } = supabase.storage.from("media").getPublicUrl(storagePath);
        mediaUrl = data.publicUrl;
      } else {
        setProgress(70);
      }

      const { data: inserted, error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          category,
          media_url: mediaUrl,
          media_type: mediaType,
          storage_path: storagePath,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      setProgress(100);
      router.push(`/post/${inserted.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex gap-2">
        {(
          [
            ["media", "Media", Upload],
            ["text", "Text post", Type],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm",
              mode === value
                ? "bg-violet-600 text-white"
                : "border border-white/10 text-zinc-400",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === "media" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition",
            dragOver
              ? "border-violet-400 bg-violet-500/10"
              : "border-white/15 bg-zinc-900/50 hover:border-violet-500/40",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.mp4,image/png,image/jpeg,image/webp,video/mp4"
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          {previewUrl && file ? (
            <div className="mx-auto max-w-lg">
              {file.type.startsWith("video/") ? (
                <video src={previewUrl} controls className="max-h-80 w-full rounded-xl" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="max-h-80 w-full rounded-xl object-contain" />
              )}
              <p className="mt-3 text-sm text-zinc-400">
                {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-400">
              <div className="flex gap-3">
                <ImageIcon className="h-8 w-8" />
                <FileVideo className="h-8 w-8" />
              </div>
              <p className="text-base text-zinc-200">Drop PNG, JPG, WEBP, or MP4 here</p>
              <p className="text-sm">Max 50MB · click to browse</p>
            </div>
          )}
        </div>
      )}

      <label className="block text-sm">
        <span className="mb-1.5 block text-zinc-300">Title</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5"
          placeholder="Give it a name"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-zinc-300">Description</span>
        <textarea
          required={mode === "text"}
          rows={mode === "text" ? 8 : 4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5"
          placeholder={mode === "text" ? "Write the post..." : "What is this about?"}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-zinc-300">Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5"
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      {submitting && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-zinc-400">
            <span>Uploading</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium shadow-glow hover:bg-violet-500 disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Publish
      </button>
    </form>
  );
}

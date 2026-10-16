"use client";

import { useMemo, useState } from "react";
import type { PostWithMeta } from "@/lib/types";
import { FilterBar } from "@/components/filter-bar";
import { PostCard } from "@/components/post-card";

export function DiscoveryFeed({ posts }: { posts: PostWithMeta[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const matchesTitle = !q || post.title.toLowerCase().includes(q);
      return matchesCategory && matchesTitle;
    });
  }, [posts, query, category]);

  return (
    <>
      <FilterBar
        query={query}
        category={category}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
      />
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-zinc-400">
          No posts match that filter. Try another category or search.
        </div>
      ) : (
        <div className="masonry">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}

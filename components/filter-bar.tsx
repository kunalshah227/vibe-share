"use client";

import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  query: string;
  category: string;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export function FilterBar({ query, category, onQueryChange, onCategoryChange }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search titles..."
          className="w-full rounded-full border border-white/10 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange("All")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition",
            category === "All"
              ? "bg-violet-600 text-white"
              : "border border-white/10 text-zinc-400 hover:text-white",
          )}
        >
          All
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onCategoryChange(item)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              category === item
                ? "bg-violet-600 text-white"
                : "border border-white/10 text-zinc-400 hover:text-white",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

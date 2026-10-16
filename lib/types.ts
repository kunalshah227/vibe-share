import type { Category } from "./constants";

export type MediaType = "image" | "video" | "text";

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: Category | string;
  media_url: string | null;
  media_type: MediaType;
  storage_path: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type PostWithMeta = Post & {
  profiles: Pick<Profile, "id" | "username" | "avatar_url"> | null;
  likes: { count: number }[];
  comments: { count: number }[];
};

export type CommentWithAuthor = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles: Pick<Profile, "id" | "username" | "avatar_url"> | null;
};

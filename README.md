# Vibe Share

Modern content-sharing app: Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, and Supabase (Auth, Postgres, Storage).

## Step 1 — initialize and install

From PowerShell:

```powershell
cd "$env:USERPROFILE\Projects"
npx create-next-app@latest vibe-share --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm
cd vibe-share
npm install @supabase/ssr @supabase/supabase-js lucide-react
```

This repository is already scaffolded. If you are starting from these files, install and run:

```powershell
cd "$env:USERPROFILE\Projects\vibe-share"
npm install
copy .env.local.example .env.local
```

Add your project URL and anon key to `.env.local`, then:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Step 2 — Supabase SQL

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` into `.env.local`.
3. In **SQL Editor**, run the full script in `supabase/schema.sql`.
4. Confirm a public Storage bucket named `media` exists (the SQL inserts it).
5. Auth → Providers: enable Email. Turn off “Confirm email” while developing if you want password login immediately.

The script creates `profiles`, `posts`, `likes`, `comments`, RLS policies, a signup trigger, `increment_view_count`, and storage policies (users may only write under `{user_id}/...`).

## Step 3 — app structure

```
app/                 # routes (home, auth, upload, profile, post/[id], creator/[username])
components/          # UI modules
lib/supabase/        # browser, server, and middleware clients
lib/constants.ts     # categories and upload limits
supabase/schema.sql  # database + storage policies
```

Protected routes: `/upload` and `/profile` (see `middleware.ts`).

import { redirect } from "next/navigation";
import { UploadForm } from "@/components/upload-form";
import { createClient } from "@/lib/supabase/server";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/upload");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Drop something new</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Images and short videos up to 50MB, or a text post. Add a title, description, and category.
      </p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
        <UploadForm userId={user.id} />
      </div>
    </div>
  );
}

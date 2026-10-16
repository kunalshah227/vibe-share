import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-semibold">Post not found</h1>
      <p className="mt-2 text-sm text-zinc-400">It may have been deleted.</p>
      <Link href="/" className="mt-6 inline-block text-violet-300 hover:text-violet-200">
        Back to the feed
      </Link>
    </div>
  );
}

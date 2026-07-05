"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function ArticleActions({
  articleId,
  slug,
}: {
  articleId: string;
  slug: string;
}) {
  const router = useRouter();

  async function remove() {
    if (!confirm("Delete this article?")) return;
    const res = await fetch(`/api/kb/${articleId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/kb");
      router.refresh();
    }
  }

  return (
    <div className="flex shrink-0 gap-3 text-sm font-medium">
      <Link
        href={`/kb/${slug}/edit`}
        className="text-indigo-600 hover:text-indigo-500"
      >
        Edit
      </Link>
      <button onClick={remove} className="text-red-600 hover:text-red-500">
        Delete
      </button>
    </div>
  );
}

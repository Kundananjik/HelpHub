"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Field";
import { SpinnerIcon } from "@/components/icons";

export function ArticleForm({
  articleId,
  initial,
}: {
  articleId?: string;
  initial?: {
    title: string;
    body: string;
    category: string | null;
    published: boolean;
  };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const url = articleId ? `/api/kb/${articleId}` : "/api/kb";
    const method = articleId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, category, published }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save article.");
      return;
    }
    const data = await res.json();
    router.push(`/kb/${data.slug}`);
    router.refresh();
  }

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. How to reset your password"
          />
        </div>
        <div>
          <Label htmlFor="category">Category (optional)</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Accounts"
          />
        </div>
        <div>
          <Label htmlFor="body">Content</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            className="min-h-[240px]"
            placeholder="Write the article. Plain text with line breaks."
          />
          <FieldError />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Published (visible to everyone)
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <SpinnerIcon className="h-4 w-4" />}
            {articleId ? "Save changes" : "Publish article"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

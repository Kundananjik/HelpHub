"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Field";
import { PlusIcon, SpinnerIcon } from "@/components/icons";

type Canned = { id: string; title: string; body: string };

export function CannedResponsesManager({ items }: { items: Canned[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/canned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create.");
      return;
    }
    setTitle("");
    setBody("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this canned response?")) return;
    const res = await fetch(`/api/canned/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="canned-title">Title</Label>
          <Input
            id="canned-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Password reset instructions"
          />
        </div>
        <div>
          <Label htmlFor="canned-body">Response</Label>
          <Textarea
            id="canned-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            placeholder="The reusable message technicians can insert…"
          />
        </div>
        <Button type="submit" disabled={saving} size="sm">
          {saving ? (
            <SpinnerIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
          Add canned response
        </Button>
      </form>

      {items.length > 0 && (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {c.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {c.body}
                </p>
              </div>
              <button
                onClick={() => remove(c.id)}
                className="shrink-0 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

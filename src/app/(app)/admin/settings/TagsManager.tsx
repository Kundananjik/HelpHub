"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { TagBadge } from "@/components/ui/Badge";
import { PlusIcon, SpinnerIcon } from "@/components/icons";
import { TAG_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Tag = { id: string; name: string; color: string };

export function TagsManager({ items }: { items: Tag[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>("slate");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create tag.");
      return;
    }
    setName("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this tag? It will be removed from all tickets.")) return;
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Tag name (e.g. VIP, Hardware-Repair)"
        />
        <div className="flex flex-wrap gap-2">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "rounded-full p-0.5 ring-2 transition",
                color === c ? "ring-indigo-500" : "ring-transparent"
              )}
              aria-label={`Color ${c}`}
            >
              <TagBadge name={c} color={c} />
            </button>
          ))}
        </div>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? (
            <SpinnerIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
          Add tag
        </Button>
      </form>

      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {items.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1">
              <TagBadge name={t.name} color={t.color} />
              <button
                onClick={() => remove(t.id)}
                className="text-xs text-slate-400 hover:text-red-600"
                aria-label={`Delete ${t.name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

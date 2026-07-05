"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { TagBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SpinnerIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Tag = { id: string; name: string; color: string };

export function TicketTags({
  ticketId,
  currentTags,
  canEdit,
}: {
  ticketId: string;
  currentTags: Tag[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [all, setAll] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<string[]>(
    currentTags.map((t) => t.id)
  );
  const [saving, setSaving] = useState(false);

  // Hide entirely if there's nothing to show and the viewer can't edit.
  if (currentTags.length === 0 && !canEdit) return null;

  async function openEditor() {
    setEditing(true);
    if (all.length === 0) {
      const res = await fetch("/api/tags", { cache: "no-store" });
      if (res.ok) setAll((await res.json()).items);
    }
  }

  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/tickets/${ticketId}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds: selected }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader
        title="Tags"
        action={
          canEdit && !editing ? (
            <button
              onClick={openEditor}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              Edit
            </button>
          ) : undefined
        }
      />
      <div className="p-5">
        {editing ? (
          <div className="space-y-3">
            {all.length === 0 ? (
              <p className="text-sm text-slate-400">No tags defined yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {all.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-opacity",
                      selected.includes(t.id)
                        ? "opacity-100"
                        : "opacity-40 hover:opacity-70"
                    )}
                  >
                    <TagBadge name={t.name} color={t.color} />
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving}>
                {saving && <SpinnerIcon className="h-4 w-4" />}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setSelected(currentTags.map((t) => t.id));
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : currentTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {currentTags.map((t) => (
              <TagBadge key={t.id} name={t.name} color={t.color} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No tags yet.</p>
        )}
      </div>
    </Card>
  );
}

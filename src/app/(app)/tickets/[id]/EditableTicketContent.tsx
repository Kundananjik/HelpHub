"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { SpinnerIcon } from "@/components/icons";

export function EditableTicketContent({
  ticketId,
  title,
  description,
  canEdit,
}: {
  ticketId: string;
  title: string;
  description: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState(title);
  const [d, setD] = useState(description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, description: d }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save changes.");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="mt-3 space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}
        <Input value={t} onChange={(e) => setT(e.target.value)} />
        <Textarea
          value={d}
          onChange={(e) => setD(e.target.value)}
          className="min-h-[140px]"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving && <SpinnerIcon className="h-4 w-4" />}
            Save changes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(false);
              setT(title);
              setD(description);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        )}
      </div>
      <div className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {description}
      </div>
    </>
  );
}

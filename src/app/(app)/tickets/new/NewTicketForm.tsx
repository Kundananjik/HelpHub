"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/Field";
import { SpinnerIcon, PaperclipIcon } from "@/components/icons";
import {
  CATEGORIES,
  PRIORITIES,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
} from "@/lib/constants";

type Attachment = { filename: string; contentType: string; data: string };

const MAX_FILE_BYTES = 2 * 1024 * 1024;

function readFile(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        data: String(reader.result),
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function NewTicketForm({
  departments,
}: {
  departments: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const next: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        setError(`"${file.name}" is larger than 2MB.`);
        continue;
      }
      next.push(await readFile(file));
    }
    setAttachments((prev) => [...prev, ...next]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get("title")),
      description: String(form.get("description")),
      category: String(form.get("category")),
      priority: String(form.get("priority")),
      departmentId: String(form.get("departmentId")) || null,
      attachments,
    };

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create ticket.");
      return;
    }
    const data = await res.json();
    router.push(`/tickets/${data.id}`);
    router.refresh();
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            minLength={4}
            placeholder="e.g. Laptop won't connect to Wi-Fi"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            minLength={10}
            className="min-h-[140px]"
            placeholder="Describe the issue, what you were doing, and any error messages…"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" name="category" defaultValue="OTHER">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" name="priority" defaultValue="MEDIUM">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="departmentId">Department</Label>
            <Select id="departmentId" name="departmentId" defaultValue="">
              <option value="">Select…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>Attachments (optional)</Label>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
            <PaperclipIcon className="mb-1 h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Click to upload screenshots (max 2MB each)
            </span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.log"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          {attachments.length > 0 && (
            <ul className="mt-2 space-y-1">
              {attachments.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <span className="truncate">{a.filename}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="text-xs font-medium text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <FieldError />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <SpinnerIcon className="h-4 w-4" />}
            {loading ? "Submitting…" : "Submit ticket"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

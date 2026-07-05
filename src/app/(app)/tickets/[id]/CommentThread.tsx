"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { SendIcon, SpinnerIcon } from "@/components/icons";
import { timeAgo } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

type Comment = {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: Date;
  author: { id: string; name: string; role: Role };
};

export function CommentThread({
  ticketId,
  comments,
  isStaff,
  currentUserId,
}: {
  ticketId: string;
  comments: Comment[];
  isStaff: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, isInternal }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to post comment.");
      return;
    }
    setBody("");
    setIsInternal(false);
    router.refresh();
  }

  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {comments.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-slate-400">
            No comments yet. Start the conversation below.
          </li>
        )}
        {comments.map((c) => {
          const mine = c.author.id === currentUserId;
          return (
            <li key={c.id} className="flex gap-3 px-5 py-4">
              <Avatar name={c.author.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">
                    {c.author.name}
                    {mine && (
                      <span className="ml-1 text-xs text-slate-400">(you)</span>
                    )}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {ROLE_LABELS[c.author.role]}
                  </span>
                  {c.isInternal && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                      Internal note
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700",
                    c.isInternal && "rounded-md bg-amber-50 p-2"
                  )}
                >
                  {c.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <form
        onSubmit={submit}
        className="border-t border-slate-100 bg-slate-50 p-4"
      >
        {error && (
          <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            isStaff
              ? "Add a reply or troubleshooting note…"
              : "Reply to the technician…"
          }
          className="bg-white"
        />
        <div className="mt-2 flex items-center justify-between">
          {isStaff ? (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Internal note (hidden from requester)
            </label>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={loading || !body.trim()}>
            {loading ? (
              <SpinnerIcon className="h-4 w-4" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
            {loading ? "Posting…" : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}

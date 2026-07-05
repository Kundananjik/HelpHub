"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { PriorityBadge, CategoryBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckIcon, InboxIcon, SpinnerIcon, ClockIcon } from "@/components/icons";
import { ticketNumber, timeAgo, cn } from "@/lib/utils";
import type { Priority, Category } from "@prisma/client";

type QueueItem = {
  id: string;
  number: number;
  title: string;
  priority: Priority;
  category: Category;
  createdAt: Date;
};

const ACCENT: Record<Priority, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-sky-500",
  LOW: "bg-slate-300 dark:bg-slate-600",
};

export function UnassignedQueue({ items }: { items: QueueItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function assign(id: string) {
    setBusy(id);
    setError(null);
    const res = await fetch(`/api/tickets/${id}/assign`, { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not assign ticket.");
      return;
    }
    router.refresh();
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            Unassigned queue
            {items.length > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {items.length}
              </span>
            )}
          </span>
        }
        action={
          <Link
            href="/tickets?assignment=unassigned"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
          >
            See all
          </Link>
        }
      />

      {error && (
        <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={<InboxIcon />}
            title="Queue is clear"
            description="Every ticket has an owner. Nice work!"
          />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((t) => (
            <li
              key={t.id}
              className="relative flex items-center gap-3 py-3 pl-4 pr-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <span
                className={cn(
                  "absolute left-0 top-2 bottom-2 w-1 rounded-full",
                  ACCENT[t.priority]
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <PriorityBadge priority={t.priority} />
                  <CategoryBadge category={t.category} />
                </div>
                <Link
                  href={`/tickets/${t.id}`}
                  className="block truncate text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                >
                  {t.title}
                </Link>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <span className="font-mono">{ticketNumber(t.number)}</span>
                  <span>·</span>
                  <ClockIcon className="h-3 w-3" />
                  waiting {timeAgo(t.createdAt)}
                </p>
              </div>
              <button
                onClick={() => assign(t.id)}
                disabled={busy === t.id}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
              >
                {busy === t.id ? (
                  <SpinnerIcon className="h-3.5 w-3.5" />
                ) : (
                  <CheckIcon className="h-3.5 w-3.5" />
                )}
                Assign to me
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
} from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { TicketIcon, SpinnerIcon } from "@/components/icons";
import { ticketNumber, timeAgo } from "@/lib/utils";
import { STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { TicketRow } from "./TicketTable";
import type { Role } from "@prisma/client";

export function BulkTicketTable({
  tickets,
  role,
  tags,
}: {
  tickets: TicketRow[];
  role: Role;
  tags: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function toggleAll() {
    setSelected((s) =>
      s.size === tickets.length ? new Set() : new Set(tickets.map((t) => t.id))
    );
  }

  async function run(payload: Record<string, unknown>) {
    if (selected.size === 0) return;
    setBusy(true);
    const res = await fetch("/api/tickets/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], ...payload }),
    });
    setBusy(false);
    if (res.ok) {
      setSelected(new Set());
      router.refresh();
    }
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<TicketIcon />}
        title="No tickets found"
        description="There are no tickets matching your filters."
      />
    );
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="sticky top-16 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
            {selected.size} selected
          </span>
          {busy && <SpinnerIcon className="h-4 w-4 text-indigo-500" />}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select
              defaultValue=""
              disabled={busy}
              onChange={(e) => {
                if (e.target.value) run({ action: "status", status: e.target.value });
                e.currentTarget.value = "";
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">Set status…</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            {tags.length > 0 && (
              <select
                defaultValue=""
                disabled={busy}
                onChange={(e) => {
                  if (e.target.value) run({ action: "addTag", tagId: e.target.value });
                  e.currentTarget.value = "";
                }}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Add tag…</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
            <button
              disabled={busy}
              onClick={() => run({ action: "assignToMe" })}
              className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Assign to me
            </button>
            {role === "ADMIN" && (
              <button
                disabled={busy}
                onClick={() => {
                  if (confirm(`Delete ${selected.size} ticket(s)? This cannot be undone.`))
                    run({ action: "delete" });
                }}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={selected.size === tickets.length && tickets.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              {["Ticket", "Status", "Priority", "Assignee", "Updated"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tickets.map((t) => (
              <tr
                key={t.id}
                className={
                  selected.has(t.id)
                    ? "bg-indigo-50/50 dark:bg-indigo-500/10"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${t.title}`}
                    checked={selected.has(t.id)}
                    onChange={() => toggle(t.id)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/tickets/${t.id}`} className="block">
                    <span className="font-mono text-xs text-slate-400">
                      {ticketNumber(t.number)}
                    </span>
                    <p className="font-medium text-slate-800 hover:text-indigo-600 dark:text-slate-100">
                      {t.title}
                    </p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={t.status} />
                    <CategoryBadge category={t.category} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-4 py-3">
                  {t.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={t.assignee.name} size="sm" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {t.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {timeAgo(t.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards with selection */}
      <div className="space-y-3 md:hidden">
        {tickets.map((t) => (
          <div
            key={t.id}
            className={
              "rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900 " +
              (selected.has(t.id)
                ? "border-indigo-300 ring-1 ring-indigo-300 dark:border-indigo-500/50"
                : "border-slate-200 dark:border-slate-800")
            }
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                aria-label={`Select ${t.title}`}
                checked={selected.has(t.id)}
                onChange={() => toggle(t.id)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Link href={`/tickets/${t.id}`} className="min-w-0 flex-1">
                <span className="font-mono text-xs text-slate-400">
                  {ticketNumber(t.number)}
                </span>
                <p className="break-words font-medium text-slate-800 dark:text-slate-100">
                  {t.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                  <CategoryBadge category={t.category} />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {t.assignee ? `Assigned: ${t.assignee.name}` : "Unassigned"} ·{" "}
                  {timeAgo(t.updatedAt)}
                </p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellIcon } from "@/components/icons";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  message: string;
  ticketId: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items);
      setUnread(data.unread);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    router.refresh();
  }

  async function openItem(n: Notification) {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
    }
    setOpen(false);
    if (n.ticketId) router.push(`/tickets/${n.ticketId}`);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:w-80 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                You&apos;re all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => openItem(n)}
                      className={cn(
                        "flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800",
                        !n.read && "bg-indigo-50/50 dark:bg-indigo-500/10"
                      )}
                    >
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      )}
                      <span className={cn(!n.read ? "" : "pl-4")}>
                        <span className="block text-sm text-slate-700 dark:text-slate-200">
                          {n.message}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {timeAgo(new Date(n.createdAt))}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-slate-100 px-4 py-2 text-center dark:border-slate-800">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

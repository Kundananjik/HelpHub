"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Role } from "@prisma/client";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { IdleTimeout } from "./IdleTimeout";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { ROLE_LABELS } from "@/lib/constants";
import { TicketIcon, MenuIcon, LogoutIcon } from "@/components/icons";
import { signOutAction } from "@/app/(app)/actions";

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: Role };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const brand = (
    <Link href="/" className="flex items-center gap-2 px-5 py-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <TicketIcon />
      </span>
      <span className="text-lg font-bold text-slate-900 dark:text-white">
        HelpHub
      </span>
    </Link>
  );

  const userBlock = (
    <div className="border-t border-slate-100 p-3 dark:border-slate-800">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {user.name}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {ROLE_LABELS[user.role]}
          </p>
        </div>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10"
        >
          <LogoutIcon className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <IdleTimeout />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        {brand}
        <Sidebar role={user.role} />
        {userBlock}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {brand}
            <Sidebar role={user.role} onNavigate={() => setOpen(false)} />
            {userBlock}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
            <span className="flex items-center gap-2 font-bold text-slate-900 lg:hidden dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
                <TicketIcon className="h-4 w-4" />
              </span>
              HelpHub
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto min-h-[calc(100vh-9rem)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        >
          {children}
        </main>
        <Footer className="bg-transparent dark:bg-transparent" />
      </div>
    </div>
  );
}

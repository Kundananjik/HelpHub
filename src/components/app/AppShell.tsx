"use client";

import { useState } from "react";
import Link from "next/link";
import type { Role } from "@prisma/client";
import { Sidebar } from "./Sidebar";
import { Avatar } from "@/components/ui/Avatar";
import { ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  TicketIcon,
  MenuIcon,
  LogoutIcon,
} from "@/components/icons";
import { signOutAction } from "@/app/(app)/actions";

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: Role };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const brand = (
    <Link href="/" className="flex items-center gap-2 px-5 py-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <TicketIcon />
      </span>
      <span className="text-lg font-bold text-slate-900">HelpHub</span>
    </Link>
  );

  const userBlock = (
    <div className="border-t border-slate-100 p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">
            {user.name}
          </p>
          <p className="truncate text-xs text-slate-500">
            {ROLE_LABELS[user.role]}
          </p>
        </div>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogoutIcon className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {brand}
        <Sidebar role={user.role} />
        {userBlock}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-slate-200 bg-white">
            {brand}
            <Sidebar role={user.role} onNavigate={() => setOpen(false)} />
            {userBlock}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <span className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
              <TicketIcon className="h-4 w-4" />
            </span>
            HelpHub
          </span>
        </header>

        <main className={cn("mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8")}>
          {children}
        </main>
      </div>
    </div>
  );
}

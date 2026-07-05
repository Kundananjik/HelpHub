"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/icons";

const FLAG = "helphub:justLoggedIn";

export function WelcomeToast({ name }: { name: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let shouldShow = false;
    try {
      shouldShow = sessionStorage.getItem(FLAG) === "1";
      if (shouldShow) sessionStorage.removeItem(FLAG);
    } catch {
      /* ignore */
    }
    if (!shouldShow) return;

    setVisible(true);
    const hide = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(hide);
  }, []);

  if (!visible) return null;

  const firstName = name.split(" ")[0] || name;

  return (
    <div
      className="fixed right-4 top-4 z-[70] w-[calc(100vw-2rem)] max-w-sm sm:right-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-lg dark:border-emerald-500/30 dark:bg-slate-900">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Welcome back, {firstName}! 👋
          </p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            You&apos;ve signed in successfully.
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

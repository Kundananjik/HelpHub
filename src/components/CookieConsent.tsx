"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-notice-ack";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* ignore */
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-900">
        <p className="flex-1 text-sm text-slate-600 dark:text-slate-300">
          HelpHub uses only strictly-necessary cookies to keep you signed in and
          secure. See our{" "}
          <Link
            href="/cookies"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Cookie Policy
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

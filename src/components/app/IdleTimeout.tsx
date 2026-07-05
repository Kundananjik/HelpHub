"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClockIcon } from "@/components/icons";

// Minutes of inactivity before automatic logout (overridable at build time).
const IDLE_MINUTES = Number(
  process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES ?? "15"
);
const IDLE_MS = Math.max(1, IDLE_MINUTES) * 60_000;
const WARNING_MS = 60_000; // show a warning 60s before logout
const ACTIVITY_KEY = "helphub:lastActivity";
const LOGOUT_KEY = "helphub:logout";

export function IdleTimeout() {
  const lastActivityRef = useRef(Date.now());
  const lastWriteRef = useRef(0);
  const [remaining, setRemaining] = useState<number | null>(null);

  const bumpActivity = useCallback((broadcast: boolean) => {
    const now = Date.now();
    lastActivityRef.current = now;
    if (broadcast) {
      try {
        localStorage.setItem(ACTIVITY_KEY, String(now));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.setItem(LOGOUT_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    await signOut({ redirectTo: "/login?timeout=1" });
  }, []);

  useEffect(() => {
    bumpActivity(true);

    const onActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;
      // Throttle cross-tab writes to once every 5s.
      if (now - lastWriteRef.current > 5000) {
        lastWriteRef.current = now;
        try {
          localStorage.setItem(ACTIVITY_KEY, String(now));
        } catch {
          /* ignore */
        }
      }
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true })
    );

    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVITY_KEY && e.newValue) {
        lastActivityRef.current = Math.max(
          lastActivityRef.current,
          Number(e.newValue)
        );
      }
      if (e.key === LOGOUT_KEY) {
        signOut({ redirectTo: "/login?timeout=1" });
      }
    };
    window.addEventListener("storage", onStorage);

    const interval = setInterval(() => {
      const timeLeft = IDLE_MS - (Date.now() - lastActivityRef.current);
      if (timeLeft <= 0) {
        logout();
      } else if (timeLeft <= WARNING_MS) {
        setRemaining(Math.ceil(timeLeft / 1000));
      } else {
        setRemaining((r) => (r === null ? r : null));
      }
    }, 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [bumpActivity, logout]);

  if (remaining === null) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label="Session about to expire"
    >
      <div className="absolute inset-0 bg-slate-900/50" />
      <Card className="relative w-full max-w-sm p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10">
          <ClockIcon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          Still there?
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          You&apos;ll be signed out in{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {remaining}s
          </span>{" "}
          due to inactivity.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => logout()}
          >
            Log out now
          </Button>
          <Button
            onClick={() => {
              bumpActivity(true);
              setRemaining(null);
            }}
          >
            Stay signed in
          </Button>
        </div>
      </Card>
    </div>
  );
}

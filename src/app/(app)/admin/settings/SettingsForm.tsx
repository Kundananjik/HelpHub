"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, SpinnerIcon } from "@/components/icons";

export function SettingsForm({ autoAssign }: { autoAssign: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(autoAssign);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function toggle(next: boolean) {
    setEnabled(next);
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoAssignEnabled: next }),
    });
    setSaving(false);
    if (!res.ok) {
      setEnabled(!next); // revert on failure
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
          Auto-assign new tickets
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Automatically assign each new ticket to the technician with the fewest
          active tickets (load balancing).
        </p>
        {saved && (
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
            <CheckIcon className="h-3.5 w-3.5" /> Saved
          </p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle auto-assignment"
        disabled={saving}
        onClick={() => toggle(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
        {saving && (
          <SpinnerIcon className="absolute -right-6 h-4 w-4 text-slate-400" />
        )}
      </button>
    </div>
  );
}

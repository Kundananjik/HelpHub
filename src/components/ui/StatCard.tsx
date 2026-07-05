import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const ACCENTS = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  sky: "bg-sky-50 text-sky-600",
  purple: "bg-purple-50 text-purple-600",
  slate: "bg-slate-100 text-slate-600",
};

export function StatCard({
  label,
  value,
  icon,
  accent = "indigo",
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: keyof typeof ACCENTS;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:mt-2 sm:text-3xl dark:text-white">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10",
              ACCENTS[accent]
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { formatDueLabel } from "@/lib/sla";
import { cn } from "@/lib/utils";

function Row({
  label,
  due,
  met,
}: {
  label: string;
  due: string;
  met: boolean;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const dueDate = new Date(due);
  const overdue = !met && new Date() > dueDate;

  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd>
        {met ? (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300">
            Met
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
              overdue
                ? "bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300"
                : "bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300"
            )}
          >
            {formatDueLabel(dueDate)}
          </span>
        )}
      </dd>
    </div>
  );
}

export function SlaCountdown({
  firstResponseDue,
  firstResponseMet,
  resolutionDue,
  resolutionMet,
}: {
  firstResponseDue: string;
  firstResponseMet: boolean;
  resolutionDue: string;
  resolutionMet: boolean;
}) {
  return (
    <dl className="px-5 py-2 text-sm">
      <Row
        label="First response"
        due={firstResponseDue}
        met={firstResponseMet}
      />
      <Row label="Resolution" due={resolutionDue} met={resolutionMet} />
    </dl>
  );
}

import { cn } from "@/lib/utils";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  CATEGORY_LABELS,
  TAG_COLOR_STYLES,
} from "@/lib/constants";
import type { Status, Priority, Category } from "@prisma/client";

export function TagBadge({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        TAG_COLOR_STYLES[color] ?? TAG_COLOR_STYLES.slate
      )}
    >
      {name}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        PRIORITY_STYLES[priority]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
      {CATEGORY_LABELS[category]}
    </span>
  );
}

"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input, Select } from "@/components/ui/Field";
import { SearchIcon } from "@/components/icons";
import {
  STATUSES,
  PRIORITIES,
  CATEGORIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
} from "@/lib/constants";

export function TicketFilters({
  showAssignment = false,
  departments = [],
}: {
  showAssignment?: boolean;
  departments?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      // Any filter/sort change resets pagination to the first page.
      next.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`);
      });
    },
    [params, pathname, router]
  );

  return (
    <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam("q", q);
        }}
        className="relative sm:col-span-2 lg:col-span-1"
      >
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon className="h-4 w-4" />
        </span>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => setParam("q", q)}
          placeholder="Search tickets…"
          className="pl-9"
        />
      </form>

      <Select
        value={params.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </Select>

      <Select
        value={params.get("priority") ?? ""}
        onChange={(e) => setParam("priority", e.target.value)}
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </Select>

      <Select
        value={params.get("category") ?? ""}
        onChange={(e) => setParam("category", e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </Select>

      {departments.length > 0 && (
        <Select
          value={params.get("departmentId") ?? ""}
          onChange={(e) => setParam("departmentId", e.target.value)}
          aria-label="Filter by department"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      )}

      {showAssignment && (
        <Select
          value={params.get("assignment") ?? ""}
          onChange={(e) => setParam("assignment", e.target.value)}
          aria-label="Filter by assignment"
        >
          <option value="">All assignments</option>
          <option value="me">Assigned to me</option>
          <option value="unassigned">Unassigned</option>
        </Select>
      )}

      <Select
        value={params.get("sort") ?? "recent"}
        onChange={(e) => setParam("sort", e.target.value)}
        aria-label="Sort tickets"
      >
        <option value="recent">Sort: Recently updated</option>
        <option value="oldest">Sort: Oldest first</option>
        <option value="priority-high">Sort: Priority (high→low)</option>
        <option value="priority-low">Sort: Priority (low→high)</option>
      </Select>
    </div>
  );
}

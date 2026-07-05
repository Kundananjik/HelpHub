"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Label } from "@/components/ui/Field";
import { SpinnerIcon, CheckIcon } from "@/components/icons";
import {
  STATUSES,
  PRIORITIES,
  CATEGORIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
} from "@/lib/constants";
import type { Status, Priority, Category } from "@prisma/client";

export function TicketActions({
  ticketId,
  status,
  priority,
  category,
  assigneeId,
  departmentId,
  isStaff,
  isOwner,
  currentUserId,
  technicians,
  departments,
}: {
  ticketId: string;
  status: Status;
  priority: Priority;
  category: Category;
  assigneeId: string | null;
  departmentId: string | null;
  isStaff: boolean;
  isOwner: boolean;
  currentUserId: string;
  technicians: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patch(payload: Record<string, unknown>, key: string) {
    setSaving(key);
    setError(null);
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Update failed.");
      return;
    }
    router.refresh();
  }

  async function assignToMe() {
    setSaving("assign");
    setError(null);
    const res = await fetch(`/api/tickets/${ticketId}/assign`, {
      method: "POST",
    });
    setSaving(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Assignment failed.");
      return;
    }
    router.refresh();
  }

  // Employee view: close / reopen actions.
  if (!isStaff) {
    if (!isOwner) return null;
    return (
      <Card>
        <CardHeader title="Actions" />
        <div className="space-y-3 p-5">
          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {status === "RESOLVED" && (
            <Button
              className="w-full"
              onClick={() => patch({ status: "CLOSED" }, "close")}
              disabled={saving === "close"}
            >
              {saving === "close" ? (
                <SpinnerIcon className="h-4 w-4" />
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
              Close ticket
            </Button>
          )}
          {status === "CLOSED" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => patch({ status: "OPEN" }, "reopen")}
              disabled={saving === "reopen"}
            >
              {saving === "reopen" && <SpinnerIcon className="h-4 w-4" />}
              Reopen ticket
            </Button>
          )}
          {status !== "RESOLVED" && status !== "CLOSED" && (
            <p className="text-sm text-slate-500">
              You&apos;ll be able to close this ticket once a technician marks it
              as resolved.
            </p>
          )}
        </div>
      </Card>
    );
  }

  const assignedToMe = assigneeId === currentUserId;

  return (
    <Card>
      <CardHeader title="Manage ticket" />
      <div className="space-y-4 p-5">
        {error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!assignedToMe && (
          <Button className="w-full" onClick={assignToMe} disabled={saving === "assign"}>
            {saving === "assign" && <SpinnerIcon className="h-4 w-4" />}
            Assign to me
          </Button>
        )}

        <div>
          <Label htmlFor="status-select">Status</Label>
          <Select
            id="status-select"
            defaultValue={status}
            onChange={(e) => patch({ status: e.target.value }, "status")}
            disabled={saving === "status"}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="priority-select">Priority</Label>
          <Select
            id="priority-select"
            defaultValue={priority}
            onChange={(e) => patch({ priority: e.target.value }, "priority")}
            disabled={saving === "priority"}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="category-select">Category</Label>
          <Select
            id="category-select"
            defaultValue={category}
            onChange={(e) => patch({ category: e.target.value }, "category")}
            disabled={saving === "category"}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="assignee-select">Assignee</Label>
          <Select
            id="assignee-select"
            defaultValue={assigneeId ?? ""}
            onChange={(e) =>
              patch({ assigneeId: e.target.value || null }, "assignee")
            }
            disabled={saving === "assignee"}
          >
            <option value="">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="dept-select">Department</Label>
          <Select
            id="dept-select"
            defaultValue={departmentId ?? ""}
            onChange={(e) =>
              patch({ departmentId: e.target.value || null }, "department")
            }
            disabled={saving === "department"}
          >
            <option value="">None</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Card>
  );
}

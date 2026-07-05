"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Field";
import { Input } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { SearchIcon } from "@/components/icons";
import type { Role } from "@prisma/client";

type Row = {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
  departmentName: string | null;
  createdTickets: number;
  assignedTickets: number;
  createdAt: Date;
};

export function UsersTable({
  users,
  departments,
  currentUserId,
}: {
  users: Row[];
  departments: { id: string; name: string }[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function patchUser(id: string, payload: Record<string, unknown>) {
    setBusy(id);
    setError(null);
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Update failed.");
      return;
    }
    router.refresh();
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete ${name}? This removes their tickets and cannot be undone.`))
      return;
    setBusy(id);
    setError(null);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Delete failed.");
      return;
    }
    router.refresh();
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon className="h-4 w-4" />
        </span>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users…"
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Department</Th>
                <Th>Tickets</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {u.name}
                            {isSelf && (
                              <span className="ml-1 text-xs text-slate-400">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.role}
                        disabled={busy === u.id || isSelf}
                        onChange={(e) =>
                          patchUser(u.id, { role: e.target.value })
                        }
                        className="w-36"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.departmentId ?? ""}
                        disabled={busy === u.id}
                        onChange={(e) =>
                          patchUser(u.id, {
                            departmentId: e.target.value || null,
                          })
                        }
                        className="w-40"
                      >
                        <option value="">None</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <span title="Created">{u.createdTickets}</span>
                      {" / "}
                      <span title="Assigned">{u.assignedTickets}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={isSelf || busy === u.id}
                        onClick={() => deleteUser(u.id, u.name)}
                        className="text-sm font-medium text-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-2 text-xs text-slate-400">
        Ticket counts shown as created / assigned.
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

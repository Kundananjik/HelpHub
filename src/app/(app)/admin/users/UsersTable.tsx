"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Field";
import { Input, Label } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ROLES,
  ROLE_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { SearchIcon, SpinnerIcon, CheckIcon } from "@/components/icons";
import type { Role, Category } from "@prisma/client";

function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

type Row = {
  id: string;
  name: string;
  email: string;
  role: Role;
  skills: Category[];
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
  const [resetting, setResetting] = useState<{ id: string; name: string } | null>(
    null
  );
  const [newPwd, setNewPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdDone, setPwdDone] = useState(false);
  const [skillsFor, setSkillsFor] = useState<Row | null>(null);
  const [skillSel, setSkillSel] = useState<Category[]>([]);
  const [skillSaving, setSkillSaving] = useState(false);

  function openSkills(u: Row) {
    setSkillsFor(u);
    setSkillSel(u.skills);
  }
  function toggleSkill(c: Category) {
    setSkillSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  }
  async function saveSkills() {
    if (!skillsFor) return;
    setSkillSaving(true);
    const res = await fetch(`/api/users/${skillsFor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills: skillSel }),
    });
    setSkillSaving(false);
    if (res.ok) {
      setSkillsFor(null);
      router.refresh();
    }
  }

  async function submitReset() {
    if (!resetting) return;
    if (newPwd.length < 8) {
      setPwdError("Password must be at least 8 characters.");
      return;
    }
    setPwdSaving(true);
    setPwdError(null);
    const res = await fetch(`/api/users/${resetting.id}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: newPwd }),
    });
    setPwdSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPwdError(data.error ?? "Could not reset password.");
      return;
    }
    setPwdDone(true);
  }

  function closeReset() {
    setResetting(null);
    setNewPwd("");
    setPwdError(null);
    setPwdDone(false);
  }

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
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Department</Th>
                <Th>Tickets</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
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
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      <span title="Created">{u.createdTickets}</span>
                      {" / "}
                      <span title="Assigned">{u.assignedTickets}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.role === "TECHNICIAN" && (
                          <button
                            onClick={() => openSkills(u)}
                            className="whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Skills
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setResetting({ id: u.id, name: u.name })
                          }
                          className="whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Reset password
                        </button>
                        <button
                          disabled={isSelf || busy === u.id}
                          onClick={() => deleteUser(u.id, u.name)}
                          className="text-sm font-medium text-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:text-slate-300"
                        >
                          Delete
                        </button>
                      </div>
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
        Ticket counts shown as created / assigned. Skills drive department/skill
        auto-assignment.
      </p>

      {skillsFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setSkillsFor(null)}
          />
          <Card className="relative w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Skills — {skillsFor.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select the ticket categories this technician handles. Auto-assign
              prefers technicians whose skills match the ticket&apos;s category.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={skillSel.includes(c)}
                    onChange={() => toggleSkill(c)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {CATEGORY_LABELS[c]}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSkillsFor(null)}>
                Cancel
              </Button>
              <Button onClick={saveSkills} disabled={skillSaving}>
                {skillSaving && <SpinnerIcon className="h-4 w-4" />}
                Save skills
              </Button>
            </div>
          </Card>
        </div>
      )}

      {resetting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={closeReset}
          />
          <Card className="relative w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Reset password
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Set a new password for{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {resetting.name}
              </span>
              . Share it securely; they can change it later from their profile.
            </p>

            {pwdDone ? (
              <div className="mt-5">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckIcon className="h-4 w-4" /> Password reset successfully.
                </div>
                <div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-400">New password</p>
                  <p className="font-mono text-sm text-slate-800 dark:text-slate-100">
                    {newPwd}
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={closeReset}>Done</Button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {pwdError && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                    {pwdError}
                  </div>
                )}
                <div>
                  <Label htmlFor="new-pwd">New password</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <PasswordInput
                        id="new-pwd"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="At least 8 characters"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewPwd(generatePassword())}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeReset}>
                    Cancel
                  </Button>
                  <Button onClick={submitReset} disabled={pwdSaving}>
                    {pwdSaving && <SpinnerIcon className="h-4 w-4" />}
                    Reset password
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
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

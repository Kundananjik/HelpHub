"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BuildingIcon,
  PlusIcon,
  SpinnerIcon,
  UsersIcon,
  TicketIcon,
} from "@/components/icons";

type Dept = {
  id: string;
  name: string;
  description: string | null;
  members: number;
  tickets: number;
};

export function DepartmentsManager({
  departments,
}: {
  departments: Dept[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create department.");
      return;
    }
    setName("");
    setDescription("");
    router.refresh();
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/departments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update.");
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string, deptName: string) {
    if (!confirm(`Delete "${deptName}"? Tickets and members will be unlinked.`))
      return;
    const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader title="New department" />
          <form onSubmit={create} className="space-y-4 p-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="dept-name">Name</Label>
              <Input
                id="dept-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Finance"
              />
            </div>
            <div>
              <Label htmlFor="dept-desc">Description</Label>
              <Textarea
                id="dept-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <SpinnerIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              Create department
            </Button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {departments.length === 0 ? (
          <EmptyState
            icon={<BuildingIcon />}
            title="No departments yet"
            description="Create your first department to start routing tickets."
          />
        ) : (
          <div className="space-y-3">
            {departments.map((d) => (
              <Card key={d.id} className="p-5">
                {editing === d.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <Textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(d.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <BuildingIcon />
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                          {d.name}
                        </h3>
                        {d.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {d.description}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <UsersIcon className="h-3.5 w-3.5" /> {d.members}{" "}
                            members
                          </span>
                          <span className="flex items-center gap-1">
                            <TicketIcon className="h-3.5 w-3.5" /> {d.tickets}{" "}
                            tickets
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => {
                          setEditing(d.id);
                          setEditName(d.name);
                          setEditDesc(d.description ?? "");
                        }}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(d.id, d.name)}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { SpinnerIcon, CheckIcon } from "@/components/icons";

export function ProfileForm({
  user,
  departments,
}: {
  user: {
    name: string;
    jobTitle: string | null;
    phone: string | null;
    departmentId: string | null;
  };
  departments: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      jobTitle: String(form.get("jobTitle")) || null,
      phone: String(form.get("phone")) || null,
      departmentId: String(form.get("departmentId")) || null,
    };
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save.");
      return;
    }
    setSaved(true);
    await update({ user: { name: payload.name } });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckIcon className="h-4 w-4" /> Profile updated.
        </div>
      )}

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="jobTitle">Job title</Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            defaultValue={user.jobTitle ?? ""}
            placeholder="e.g. Marketing Manager"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={user.phone ?? ""}
            placeholder="e.g. +1 555 010 1234"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="departmentId">Department</Label>
        <Select
          id="departmentId"
          name="departmentId"
          defaultValue={user.departmentId ?? ""}
        >
          <option value="">None</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <SpinnerIcon className="h-4 w-4" />}
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

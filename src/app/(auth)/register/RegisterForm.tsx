"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { registerAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, FieldError } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SpinnerIcon } from "@/components/icons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending && <SpinnerIcon className="h-4 w-4" />}
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export function RegisterForm({
  departments,
}: {
  departments: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionState, FormData>(
    registerAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push("/login?registered=1"), 900);
      return () => clearTimeout(t);
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state.success && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          {state.success} Redirecting…
        </div>
      )}

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Jane Doe"
          error={!!state.fieldErrors?.name}
        />
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          error={!!state.fieldErrors?.email}
        />
        <FieldError message={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="departmentId">Department (optional)</Label>
        <Select id="departmentId" name="departmentId" defaultValue="">
          <option value="">Select department…</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
          error={!!state.fieldErrors?.password}
        />
        <FieldError message={state.fieldErrors?.password} />
      </div>

      <SubmitButton />
    </form>
  );
}

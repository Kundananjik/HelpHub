"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { resetPasswordAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Label, FieldError } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SpinnerIcon } from "@/components/icons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending && <SpinnerIcon className="h-4 w-4" />}
      {pending ? "Resetting…" : "Reset password"}
    </Button>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, formAction] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push("/login?reset=1"), 1000);
      return () => clearTimeout(t);
    }
  }, [state.success, router]);

  if (!token) {
    return (
      <div className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-inset ring-amber-600/20">
        Missing reset token. Please request a new reset link.
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          {state.success} Redirecting…
        </div>
      )}

      <div>
        <Label htmlFor="password">New password</Label>
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

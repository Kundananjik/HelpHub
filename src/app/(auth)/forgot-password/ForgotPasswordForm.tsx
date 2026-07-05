"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { forgotPasswordAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { SpinnerIcon } from "@/components/icons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending && <SpinnerIcon className="h-4 w-4" />}
      {pending ? "Generating…" : "Send reset link"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    forgotPasswordAction,
    {}
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state.success && (
        <div className="space-y-2 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <p>{state.success}</p>
          {state.resetToken && (
            <p>
              <span className="font-medium">Demo:</span>{" "}
              <Link
                href={`/reset-password?token=${state.resetToken}`}
                className="font-semibold underline"
              >
                Open your reset link
              </Link>
            </p>
          )}
        </div>
      )}

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

      <SubmitButton />
    </form>
  );
}

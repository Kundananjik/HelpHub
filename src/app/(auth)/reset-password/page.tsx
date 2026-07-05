import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { Card } from "@/components/ui/Card";

export default function ResetPasswordPage() {
  return (
    <Card className="p-7">
      <h1 className="text-xl font-bold text-slate-900">Reset password</h1>
      <p className="mt-1 text-sm text-slate-500">Choose a new password.</p>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}

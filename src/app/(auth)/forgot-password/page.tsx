import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Card } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  return (
    <Card className="p-7">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Forgot password
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Enter your email and we&apos;ll generate a password reset link.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Remembered it?{" "}
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

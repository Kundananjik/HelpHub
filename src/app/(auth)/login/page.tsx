import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <Card className="p-7">
      <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sign in to your HelpHub account.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Register
        </Link>
      </p>
    </Card>
  );
}

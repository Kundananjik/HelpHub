import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RegisterForm } from "./RegisterForm";
import { Card } from "@/components/ui/Card";

export default async function RegisterPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <Card className="p-7">
      <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Register as an employee to start submitting tickets.
      </p>
      <RegisterForm departments={departments} />
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}

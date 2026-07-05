import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";
import type { Session } from "next-auth";

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(...roles: Role[]): Promise<Session> {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    redirect(dashboardPathFor(session.user.role));
  }
  return session;
}

export function dashboardPathFor(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TECHNICIAN":
      return "/technician";
    default:
      return "/dashboard";
  }
}

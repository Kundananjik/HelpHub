import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";
import type { Session } from "next-auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Ensures a session exists and (optionally) that the user has one of the
 * allowed roles. Returns the session or a NextResponse to short-circuit.
 */
export async function guard(
  ...roles: Role[]
): Promise<{ session: Session } | { response: NextResponse }> {
  const session = await auth();
  if (!session?.user) {
    return { response: error("Unauthorized", 401) };
  }
  if (roles.length > 0 && !roles.includes(session.user.role)) {
    return { response: error("Forbidden", 403) };
  }
  return { session };
}

import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["EMPLOYEE", "TECHNICIAN", "ADMIN"]).optional(),
  departmentId: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  // Prevent an admin from demoting themselves and losing admin access.
  if (
    id === g.session.user.id &&
    parsed.data.role &&
    parsed.data.role !== "ADMIN"
  ) {
    return error("You cannot change your own admin role.");
  }

  await prisma.user.update({
    where: { id },
    data: {
      role: parsed.data.role ?? undefined,
      departmentId:
        parsed.data.departmentId === undefined
          ? undefined
          : parsed.data.departmentId || null,
    },
  });

  return json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;

  if (id === g.session.user.id) {
    return error("You cannot delete your own account.");
  }

  await prisma.user.delete({ where: { id } });
  return json({ ok: true });
}

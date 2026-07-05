import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notifications";
import { ROLE_LABELS } from "@/lib/constants";

const updateUserSchema = z.object({
  role: z.enum(["EMPLOYEE", "TECHNICIAN", "ADMIN"]).optional(),
  departmentId: z.string().nullable().optional(),
  skills: z
    .array(
      z.enum([
        "HARDWARE",
        "SOFTWARE",
        "NETWORK",
        "ACCOUNT",
        "EMAIL",
        "SECURITY",
        "OTHER",
      ])
    )
    .optional(),
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

  const before = await prisma.user.findUnique({
    where: { id },
    select: { role: true, name: true },
  });
  if (!before) return error("User not found", 404);

  await prisma.user.update({
    where: { id },
    data: {
      role: parsed.data.role ?? undefined,
      departmentId:
        parsed.data.departmentId === undefined
          ? undefined
          : parsed.data.departmentId || null,
      skills: parsed.data.skills ?? undefined,
    },
  });

  if (parsed.data.role && parsed.data.role !== before.role) {
    await logAudit({
      action: "user.role_changed",
      summary: `${before.name}: ${ROLE_LABELS[before.role]} → ${ROLE_LABELS[parsed.data.role]}`,
      actorId: g.session.user.id,
    });
    await notifyUsers({
      userIds: [id],
      type: "user.role_changed",
      message: `Your role was changed to ${ROLE_LABELS[parsed.data.role]}`,
    });
  }

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

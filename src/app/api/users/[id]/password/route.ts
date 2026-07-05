import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { adminSetPasswordSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notifications";

// An admin sets a new password for a user (e.g. for those who can't self-serve).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!user) return error("User not found", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = adminSetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  await logAudit({
    action: "user.password_reset",
    summary: `Reset password for ${user.name}`,
    actorId: g.session.user.id,
  });
  await notifyUsers({
    userIds: [id],
    type: "user.password_reset",
    message:
      "An administrator reset your password. Please sign in with the new password.",
  });

  return json({ ok: true });
}

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";

// The signed-in user changes their own password.
export async function PATCH(req: Request) {
  const g = await guard();
  if ("response" in g) return g.response;

  const rl = await rateLimit(`pwchange:${g.session.user.id}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!rl.success) return error("Too many attempts. Please try again shortly.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const user = await prisma.user.findUnique({
    where: { id: g.session.user.id },
    select: { id: true, passwordHash: true },
  });
  if (!user?.passwordHash) return error("Account has no password set.", 400);

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );
  if (!valid) return error("Your current password is incorrect.");

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  await logAudit({
    action: "user.password_changed",
    summary: "Changed their own password",
    actorId: user.id,
  });

  return json({ ok: true });
}

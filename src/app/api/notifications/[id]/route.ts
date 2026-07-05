import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";

// Mark a single notification as read.
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard();
  if ("response" in g) return g.response;
  const { id } = await params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== g.session.user.id) {
    return error("Not found", 404);
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return json({ ok: true });
}

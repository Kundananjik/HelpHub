import { prisma } from "@/lib/prisma";
import { guard, json } from "@/lib/api";

// List the current user's recent notifications + unread count.
export async function GET() {
  const g = await guard();
  if ("response" in g) return g.response;

  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: g.session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        message: true,
        ticketId: true,
        read: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({
      where: { userId: g.session.user.id, read: false },
    }),
  ]);

  return json({ items, unread });
}

// Mark all of the current user's notifications as read.
export async function PATCH() {
  const g = await guard();
  if ("response" in g) return g.response;

  await prisma.notification.updateMany({
    where: { userId: g.session.user.id, read: false },
    data: { read: true },
  });

  return json({ ok: true });
}

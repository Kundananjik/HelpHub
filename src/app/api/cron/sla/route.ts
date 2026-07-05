import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { env } from "@/lib/env";
import { isSlaBreached } from "@/lib/sla";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notifications";
import { ticketNumber } from "@/lib/utils";

/**
 * Flags tickets that have breached their first-response SLA and notifies the
 * assignee + admins. Intended to be called by a scheduler (e.g. Vercel Cron).
 * Protect it with a `CRON_SECRET` bearer token in production.
 */
export async function GET(req: Request) {
  if (env.CRON_SECRET) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return error("Unauthorized", 401);
    }
  }

  const candidates = await prisma.ticket.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] },
      slaBreached: false,
    },
    select: {
      id: true,
      number: true,
      title: true,
      priority: true,
      status: true,
      createdAt: true,
      firstResponseAt: true,
      assigneeId: true,
    },
  });

  const now = new Date();
  const breached = candidates.filter((t) => isSlaBreached(t, now));

  if (breached.length === 0) {
    return json({ checked: candidates.length, breached: 0 });
  }

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  const adminIds = admins.map((a) => a.id);

  for (const t of breached) {
    await prisma.ticket.update({
      where: { id: t.id },
      data: { slaBreached: true },
    });
    await logAudit({
      action: "ticket.sla_breached",
      summary: `SLA breached for ${ticketNumber(t.number)}`,
      ticketId: t.id,
    });
    await notifyUsers({
      userIds: [...(t.assigneeId ? [t.assigneeId] : []), ...adminIds],
      type: "ticket.sla_breached",
      message: `SLA breached: "${t.title}" (${t.priority})`,
      ticketId: t.id,
    });
  }

  return json({ checked: candidates.length, breached: breached.length });
}

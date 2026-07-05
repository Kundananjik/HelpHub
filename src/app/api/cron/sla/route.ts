import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { env } from "@/lib/env";
import {
  isSlaBreached,
  isResolutionBreached,
  escalatePriority,
} from "@/lib/sla";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notifications";
import { ticketNumber } from "@/lib/utils";

/**
 * Flags tickets that have breached their first-response or resolution SLA,
 * auto-escalates unacknowledged breaches, and notifies the assignee + admins.
 * Intended to be called by a scheduler (e.g. Vercel Cron). Protect it with a
 * `CRON_SECRET` bearer token in production.
 */
export async function GET(req: Request) {
  if (env.CRON_SECRET) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return error("Unauthorized", 401);
    }
  }

  const active = await prisma.ticket.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] } },
    select: {
      id: true,
      number: true,
      title: true,
      priority: true,
      status: true,
      createdAt: true,
      firstResponseAt: true,
      assigneeId: true,
      slaBreached: true,
      resolutionBreached: true,
      escalated: true,
    },
  });

  const now = new Date();
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  const adminIds = admins.map((a) => a.id);

  let firstResponseBreaches = 0;
  let resolutionBreaches = 0;
  let escalations = 0;

  for (const t of active) {
    const recipients = [...(t.assigneeId ? [t.assigneeId] : []), ...adminIds];

    // First-response breach
    if (!t.slaBreached && isSlaBreached(t, now)) {
      firstResponseBreaches++;
      const data: {
        slaBreached: boolean;
        escalated?: boolean;
        priority?: ReturnType<typeof escalatePriority>;
      } = { slaBreached: true };

      // Auto-escalate the first time a first-response SLA is missed.
      if (!t.escalated && t.priority !== "URGENT") {
        const next = escalatePriority(t.priority);
        data.escalated = true;
        data.priority = next;
        escalations++;
        await logAudit({
          action: "ticket.escalated",
          summary: `Auto-escalated ${t.priority} → ${next} (SLA breach)`,
          ticketId: t.id,
        });
      }

      await prisma.ticket.update({ where: { id: t.id }, data });
      await logAudit({
        action: "ticket.sla_breached",
        summary: `First-response SLA breached for ${ticketNumber(t.number)}`,
        ticketId: t.id,
      });
      await notifyUsers({
        userIds: recipients,
        type: "ticket.sla_breached",
        message: `SLA breached: "${t.title}"`,
        ticketId: t.id,
      });
    }

    // Resolution breach
    if (!t.resolutionBreached && isResolutionBreached(t, now)) {
      resolutionBreaches++;
      await prisma.ticket.update({
        where: { id: t.id },
        data: { resolutionBreached: true },
      });
      await logAudit({
        action: "ticket.resolution_breached",
        summary: `Resolution SLA breached for ${ticketNumber(t.number)}`,
        ticketId: t.id,
      });
      await notifyUsers({
        userIds: recipients,
        type: "ticket.resolution_breached",
        message: `Resolution overdue: "${t.title}"`,
        ticketId: t.id,
      });
    }
  }

  return json({
    checked: active.length,
    firstResponseBreaches,
    resolutionBreaches,
    escalations,
  });
}

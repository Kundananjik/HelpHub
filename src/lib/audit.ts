import { prisma } from "@/lib/prisma";

export async function logAudit(args: {
  action: string;
  summary: string;
  actorId?: string | null;
  ticketId?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: args.action,
        summary: args.summary,
        actorId: args.actorId ?? null,
        ticketId: args.ticketId ?? null,
      },
    });
  } catch (err) {
    // Auditing should never block the primary operation.
    console.error("[audit] failed to write log:", err);
  }
}

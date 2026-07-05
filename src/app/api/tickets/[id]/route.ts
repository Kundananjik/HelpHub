import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { z } from "zod";
import {
  isStaff,
  evaluateEmployeeTicketUpdate,
  nextResolvedAt,
} from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notifications";
import { STATUS_LABELS } from "@/lib/constants";

const updateSchema = z.object({
  status: z
    .enum(["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z
    .enum([
      "HARDWARE",
      "SOFTWARE",
      "NETWORK",
      "ACCOUNT",
      "EMAIL",
      "SECURITY",
      "OTHER",
    ])
    .optional(),
  assigneeId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard();
  if ("response" in g) return g.response;
  const { id } = await params;
  const { user } = g.session;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return error("Ticket not found", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const data = parsed.data;

  const staff = isStaff(user.role);
  const isOwner = ticket.creatorId === user.id;

  if (!staff) {
    const decision = evaluateEmployeeTicketUpdate(
      data,
      ticket.status,
      isOwner
    );
    if (!decision.allowed) {
      return error(decision.reason, decision.reason === "Forbidden" ? 403 : 400);
    }
  }

  const resolvedAt = nextResolvedAt(data.status, ticket.resolvedAt);
  const statusChanged = data.status && data.status !== ticket.status;
  const assigneeChanged =
    staff &&
    data.assigneeId !== undefined &&
    data.assigneeId !== ticket.assigneeId;

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status: data.status ?? undefined,
      priority: staff ? data.priority ?? undefined : undefined,
      category: staff ? data.category ?? undefined : undefined,
      assigneeId: staff ? data.assigneeId : undefined,
      departmentId: staff ? data.departmentId : undefined,
      resolvedAt,
      // Any active status other than OPEN counts as a first response from staff.
      firstResponseAt:
        staff && !ticket.firstResponseAt && data.status && data.status !== "OPEN"
          ? new Date()
          : undefined,
      slaBreached:
        data.status === "RESOLVED" || data.status === "CLOSED"
          ? false
          : undefined,
    },
    select: { id: true, number: true, title: true, creatorId: true, assigneeId: true },
  });

  // Audit + notifications for meaningful changes.
  if (statusChanged && data.status) {
    await logAudit({
      action: "ticket.status_changed",
      summary: `Status changed to ${STATUS_LABELS[data.status]}`,
      actorId: user.id,
      ticketId: id,
    });
    if (data.status === "RESOLVED") {
      await notifyUsers({
        userIds: [updated.creatorId],
        type: "ticket.resolved",
        message: `Your ticket "${updated.title}" was marked resolved`,
        ticketId: id,
        email: {
          heading: "Your ticket was resolved",
          ticketTitle: updated.title,
          ticketNumberValue: updated.number,
          body: "A technician marked your ticket as resolved. You can close it if the issue is fixed.",
        },
      });
    }
    if (data.status === "CLOSED" && !staff && updated.assigneeId) {
      await notifyUsers({
        userIds: [updated.assigneeId],
        type: "ticket.closed",
        message: `Ticket "${updated.title}" was closed by the requester`,
        ticketId: id,
      });
    }
  }

  if (assigneeChanged && updated.assigneeId) {
    await logAudit({
      action: "ticket.assigned",
      summary: `Ticket assigned`,
      actorId: user.id,
      ticketId: id,
    });
    if (updated.assigneeId !== user.id) {
      await notifyUsers({
        userIds: [updated.assigneeId],
        type: "ticket.assigned",
        message: `You were assigned ticket "${updated.title}"`,
        ticketId: id,
      });
    }
  }

  return json({ id: updated.id });
}

import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { commentSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";
import {
  isStaff,
  canCommentOnTicket,
  canPostInternalNote,
} from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard();
  if ("response" in g) return g.response;
  const { id } = await params;
  const { user } = g.session;

  const rl = await rateLimit(`comment:${user.id}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.success) return error("Too many comments. Please slow down.", 429);

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      creatorId: true,
      assigneeId: true,
      firstResponseAt: true,
    },
  });
  if (!ticket) return error("Ticket not found", 404);

  const staff = isStaff(user.role);
  if (!canCommentOnTicket(user.role, user.id, ticket.creatorId)) {
    return error("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const isInternal =
    canPostInternalNote(user.role) && Boolean(parsed.data.isInternal);

  const comment = await prisma.comment.create({
    data: {
      body: parsed.data.body,
      isInternal,
      ticketId: id,
      authorId: user.id,
    },
    select: { id: true },
  });

  // A public staff comment counts as the first response for SLA purposes.
  await prisma.ticket.update({
    where: { id },
    data: {
      updatedAt: new Date(),
      firstResponseAt:
        staff && !isInternal && !ticket.firstResponseAt
          ? new Date()
          : undefined,
    },
  });

  await logAudit({
    action: isInternal ? "comment.internal" : "comment.added",
    summary: isInternal ? "Internal note added" : "Comment added",
    actorId: user.id,
    ticketId: id,
  });

  // Notify the other party on public comments.
  if (!isInternal) {
    const recipients: string[] = [];
    if (staff) {
      recipients.push(ticket.creatorId);
    } else {
      if (ticket.assigneeId) recipients.push(ticket.assigneeId);
    }
    await notifyUsers({
      userIds: recipients.filter((r) => r !== user.id),
      type: "comment.added",
      message: `New reply on "${ticket.title}"`,
      ticketId: id,
    });
  }

  return json({ id: comment.id }, 201);
}

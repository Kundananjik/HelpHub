import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { ticketSchema } from "@/lib/validation";
import { storeAttachment } from "@/lib/storage";
import { rateLimit } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notifications";

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2MB per file (base64 stored)

export async function POST(req: Request) {
  const g = await guard();
  if ("response" in g) return g.response;

  const rl = await rateLimit(`tickets:create:${g.session.user.id}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!rl.success) return error("Too many tickets created. Please slow down.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const parsed = ticketSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { title, description, category, priority, departmentId, attachments } =
    parsed.data;

  if (attachments) {
    for (const a of attachments) {
      if (a.data.length > MAX_ATTACHMENT_BYTES * 1.4) {
        return error(`Attachment "${a.filename}" is too large (max 2MB).`);
      }
    }
  }

  const stored = attachments?.length
    ? await Promise.all(
        attachments.map((a) =>
          storeAttachment({
            filename: a.filename,
            contentType: a.contentType,
            dataUrl: a.data,
          })
        )
      )
    : [];

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      category,
      priority,
      departmentId: departmentId || null,
      creatorId: g.session.user.id,
      attachments: stored.length
        ? {
            create: stored.map((a) => ({
              filename: a.filename,
              contentType: a.contentType,
              data: a.data,
            })),
          }
        : undefined,
    },
    select: { id: true, number: true, title: true },
  });

  await logAudit({
    action: "ticket.created",
    summary: `Ticket "${ticket.title}" created`,
    actorId: g.session.user.id,
    ticketId: ticket.id,
  });

  // Notify admins so the ticket surfaces in oversight.
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await notifyUsers({
    userIds: admins.map((a) => a.id).filter((id) => id !== g.session.user.id),
    type: "ticket.created",
    message: `New ${priority} ticket: ${ticket.title}`,
    ticketId: ticket.id,
  });

  return json({ id: ticket.id }, 201);
}

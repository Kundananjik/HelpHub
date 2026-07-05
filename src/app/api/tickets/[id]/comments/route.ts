import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { commentSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard();
  if ("response" in g) return g.response;
  const { id } = await params;
  const { user } = g.session;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return error("Ticket not found", 404);

  const isStaff = user.role === "TECHNICIAN" || user.role === "ADMIN";
  const isOwner = ticket.creatorId === user.id;
  if (!isStaff && !isOwner) return error("Forbidden", 403);

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

  // Only staff can post internal (troubleshooting) notes.
  const isInternal = isStaff ? Boolean(parsed.data.isInternal) : false;

  const comment = await prisma.comment.create({
    data: {
      body: parsed.data.body,
      isInternal,
      ticketId: id,
      authorId: user.id,
    },
    select: { id: true },
  });

  // Touch the ticket's updatedAt so it surfaces as recently active.
  await prisma.ticket.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return json({ id: comment.id }, 201);
}

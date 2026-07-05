import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
});

// The ticket creator rates their resolved/closed ticket (CSAT).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard();
  if ("response" in g) return g.response;
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return error("Ticket not found", 404);
  if (ticket.creatorId !== g.session.user.id) return error("Forbidden", 403);
  if (ticket.status !== "RESOLVED" && ticket.status !== "CLOSED") {
    return error("You can only rate a resolved or closed ticket.");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Please provide a rating from 1 to 5.");

  await prisma.ticket.update({
    where: { id },
    data: {
      satisfactionRating: parsed.data.rating,
      satisfactionComment: parsed.data.comment || null,
    },
  });

  await logAudit({
    action: "ticket.rated",
    summary: `Requester rated the ticket ${parsed.data.rating}/5`,
    actorId: g.session.user.id,
    ticketId: id,
  });

  return json({ ok: true });
}

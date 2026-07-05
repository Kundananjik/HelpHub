import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const schema = z.object({ tagIds: z.array(z.string()) });

// Replace the set of tags on a ticket (staff only).
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("TECHNICIAN", "ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return error("Ticket not found", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid input");

  await prisma.ticket.update({
    where: { id },
    data: { tags: { set: parsed.data.tagIds.map((tid) => ({ id: tid })) } },
  });

  await logAudit({
    action: "ticket.tags_updated",
    summary: "Tags updated",
    actorId: g.session.user.id,
    ticketId: id,
  });

  return json({ ok: true });
}

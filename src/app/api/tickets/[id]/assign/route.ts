import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";

// Technician assigns a ticket to themselves.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("TECHNICIAN", "ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return error("Ticket not found", 404);

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      assigneeId: g.session.user.id,
      status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
    },
    select: { id: true },
  });

  return json({ id: updated.id });
}

import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { logAudit } from "@/lib/audit";

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

  const nextStatus = ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status;

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      assigneeId: g.session.user.id,
      status: nextStatus,
      firstResponseAt: ticket.firstResponseAt ?? new Date(),
    },
    select: { id: true },
  });

  await logAudit({
    action: "ticket.assigned",
    summary: `Assigned to ${g.session.user.name ?? "a technician"}`,
    actorId: g.session.user.id,
    ticketId: id,
  });

  return json({ id: updated.id });
}

import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["status", "assignToMe", "delete", "addTag"]),
  status: z
    .enum(["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"])
    .optional(),
  tagId: z.string().optional(),
});

// Bulk operations on tickets (staff only).
export async function POST(req: Request) {
  const g = await guard("TECHNICIAN", "ADMIN");
  if ("response" in g) return g.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid input");
  const { ids, action, status, tagId } = parsed.data;

  if (action === "status") {
    if (!status) return error("Missing status");
    await prisma.ticket.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      },
    });
  } else if (action === "assignToMe") {
    await prisma.ticket.updateMany({
      where: { id: { in: ids } },
      data: { assigneeId: g.session.user.id },
    });
  } else if (action === "delete") {
    if (g.session.user.role !== "ADMIN") {
      return error("Only admins can delete tickets.", 403);
    }
    await prisma.ticket.deleteMany({ where: { id: { in: ids } } });
  } else if (action === "addTag") {
    if (!tagId) return error("Missing tag");
    // connect the tag to each ticket
    await Promise.all(
      ids.map((id) =>
        prisma.ticket.update({
          where: { id },
          data: { tags: { connect: { id: tagId } } },
        })
      )
    );
  }

  await logAudit({
    action: "ticket.bulk",
    summary: `Bulk ${action} on ${ids.length} ticket(s)`,
    actorId: g.session.user.id,
  });

  return json({ ok: true, count: ids.length });
}

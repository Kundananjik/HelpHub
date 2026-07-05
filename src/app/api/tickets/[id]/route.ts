import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { z } from "zod";

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

  const isStaff = user.role === "TECHNICIAN" || user.role === "ADMIN";
  const isOwner = ticket.creatorId === user.id;

  // Employees may only close their own resolved ticket (or reopen a closed one).
  if (!isStaff) {
    if (!isOwner) return error("Forbidden", 403);
    const allowedEmployeeUpdate =
      Object.keys(data).length === 1 && data.status !== undefined;
    if (!allowedEmployeeUpdate) return error("Forbidden", 403);
    if (data.status === "CLOSED" && ticket.status !== "RESOLVED") {
      return error("Only resolved tickets can be closed.");
    }
    if (data.status === "OPEN" && ticket.status !== "CLOSED") {
      return error("You can only reopen a closed ticket.");
    }
    if (data.status !== "CLOSED" && data.status !== "OPEN") {
      return error("Forbidden", 403);
    }
  }

  let resolvedAt = ticket.resolvedAt;
  if (data.status === "RESOLVED") {
    resolvedAt = ticket.resolvedAt ?? new Date();
  } else if (
    data.status &&
    data.status !== "CLOSED" // reopening clears the resolved timestamp
  ) {
    resolvedAt = null;
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status: data.status ?? undefined,
      priority: isStaff ? data.priority ?? undefined : undefined,
      category: isStaff ? data.category ?? undefined : undefined,
      assigneeId: isStaff ? data.assigneeId : undefined,
      departmentId: isStaff ? data.departmentId : undefined,
      resolvedAt,
    },
    select: { id: true },
  });

  return json({ id: updated.id });
}

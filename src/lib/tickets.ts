import { prisma } from "@/lib/prisma";
import type { Prisma, Role, Status, Priority, Category } from "@prisma/client";

export const ticketRowSelect = {
  id: true,
  number: true,
  title: true,
  status: true,
  priority: true,
  category: true,
  updatedAt: true,
  creator: { select: { name: true } },
  assignee: { select: { name: true } },
  department: { select: { name: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.TicketSelect;

export type TicketFilters = {
  q?: string;
  status?: Status;
  priority?: Priority;
  category?: Category;
  departmentId?: string;
  assignment?: "me" | "unassigned" | "all";
};

/**
 * Builds a Prisma `where` clause scoped to the viewer's role plus any filters.
 * - EMPLOYEE: only their own tickets
 * - TECHNICIAN / ADMIN: all tickets
 */
export function buildTicketWhere(
  userId: string,
  role: Role,
  filters: TicketFilters
): Prisma.TicketWhereInput {
  const where: Prisma.TicketWhereInput = {};

  if (role === "EMPLOYEE") {
    where.creatorId = userId;
  }

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.category) where.category = filters.category;
  if (filters.departmentId) where.departmentId = filters.departmentId;

  if (role !== "EMPLOYEE") {
    if (filters.assignment === "me") where.assigneeId = userId;
    else if (filters.assignment === "unassigned") where.assigneeId = null;
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getTickets(
  userId: string,
  role: Role,
  filters: TicketFilters
) {
  return prisma.ticket.findMany({
    where: buildTicketWhere(userId, role, filters),
    select: ticketRowSelect,
    orderBy: [{ updatedAt: "desc" }],
  });
}

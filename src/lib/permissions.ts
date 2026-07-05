import type { Role, Status } from "@prisma/client";

export function isStaff(role: Role): boolean {
  return role === "TECHNICIAN" || role === "ADMIN";
}

export function canViewTicket(
  role: Role,
  userId: string,
  ticketCreatorId: string
): boolean {
  return isStaff(role) || ticketCreatorId === userId;
}

export function canCommentOnTicket(
  role: Role,
  userId: string,
  ticketCreatorId: string
): boolean {
  return isStaff(role) || ticketCreatorId === userId;
}

export function canPostInternalNote(role: Role): boolean {
  return isStaff(role);
}

export type TicketUpdateInput = {
  status?: Status;
  priority?: unknown;
  category?: unknown;
  assigneeId?: unknown;
  departmentId?: unknown;
};

export type EmployeeUpdateDecision =
  | { allowed: true }
  | { allowed: false; reason: string };

/**
 * Determines whether an employee (non-staff) is permitted to apply a ticket
 * update. Employees may only close their own resolved ticket or reopen a closed
 * one — nothing else.
 */
export function evaluateEmployeeTicketUpdate(
  data: TicketUpdateInput,
  currentStatus: Status,
  isOwner: boolean
): EmployeeUpdateDecision {
  if (!isOwner) return { allowed: false, reason: "Forbidden" };

  const keys = Object.keys(data).filter(
    (k) => (data as Record<string, unknown>)[k] !== undefined
  );
  const onlyStatus = keys.length === 1 && keys[0] === "status";
  if (!onlyStatus) return { allowed: false, reason: "Forbidden" };

  if (data.status === "CLOSED") {
    if (currentStatus !== "RESOLVED") {
      return { allowed: false, reason: "Only resolved tickets can be closed." };
    }
    return { allowed: true };
  }
  if (data.status === "OPEN") {
    if (currentStatus !== "CLOSED") {
      return { allowed: false, reason: "You can only reopen a closed ticket." };
    }
    return { allowed: true };
  }
  return { allowed: false, reason: "Forbidden" };
}

/**
 * Computes the next `resolvedAt` value given a requested status change.
 */
export function nextResolvedAt(
  requestedStatus: Status | undefined,
  currentResolvedAt: Date | null
): Date | null {
  if (requestedStatus === "RESOLVED") {
    return currentResolvedAt ?? new Date();
  }
  if (requestedStatus && requestedStatus !== "CLOSED") {
    return null; // reopened / moved back to an active state
  }
  return currentResolvedAt;
}

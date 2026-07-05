import type { Priority, Status } from "@prisma/client";

/** First-response SLA targets in minutes, keyed by priority. */
export const SLA_MINUTES: Record<Priority, number> = {
  URGENT: 60, // 1 hour
  HIGH: 240, // 4 hours
  MEDIUM: 60 * 24, // 1 business day (approx)
  LOW: 60 * 24 * 3, // 3 business days (approx)
};

const ACTIVE_STATUSES: Status[] = ["OPEN", "IN_PROGRESS", "PENDING"];

export function isActive(status: Status): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function slaDueAt(createdAt: Date, priority: Priority): Date {
  return new Date(createdAt.getTime() + SLA_MINUTES[priority] * 60_000);
}

/**
 * A ticket is breached when it is still active (unresolved) and the current
 * time is past its first-response SLA target and no first response was recorded
 * before the target.
 */
export function isSlaBreached(
  ticket: {
    createdAt: Date;
    priority: Priority;
    status: Status;
    firstResponseAt: Date | null;
  },
  now: Date = new Date()
): boolean {
  if (!isActive(ticket.status)) return false;
  const due = slaDueAt(ticket.createdAt, ticket.priority);
  if (ticket.firstResponseAt && ticket.firstResponseAt <= due) return false;
  return now > due;
}

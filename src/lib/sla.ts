import type { Priority, Status } from "@prisma/client";

/**
 * Business-hours-aware SLA calculations.
 *
 * Business hours are Monday–Friday, 09:00–17:00 in Lusaka time (Central Africa
 * Time, a fixed UTC+2 with no daylight saving). SLA windows are measured in
 * *business minutes*, so a target that spans overnight/weekends only counts
 * working time. All Date values are UTC instants; we shift by the offset to
 * evaluate local wall-clock hours.
 */
export const BUSINESS_START_HOUR = 9;
export const BUSINESS_END_HOUR = 17;
const BUSINESS_MINUTES_PER_DAY = (BUSINESS_END_HOUR - BUSINESS_START_HOUR) * 60;

// Africa/Lusaka is UTC+2 year-round.
const TZ_OFFSET_MS = 2 * 60 * 60 * 1000;

function toLocal(d: Date): Date {
  return new Date(d.getTime() + TZ_OFFSET_MS);
}

/** Builds a UTC instant from Lusaka-local wall-clock parts. */
function fromLocal(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0
): Date {
  return new Date(Date.UTC(year, month, day, hour, minute, 0) - TZ_OFFSET_MS);
}

/** First-response targets, in business minutes. */
export const SLA_MINUTES: Record<Priority, number> = {
  URGENT: 60,
  HIGH: 240,
  MEDIUM: BUSINESS_MINUTES_PER_DAY, // 1 business day
  LOW: BUSINESS_MINUTES_PER_DAY * 3, // 3 business days
};

/** Resolution targets, in business minutes. */
export const RESOLUTION_SLA_MINUTES: Record<Priority, number> = {
  URGENT: 240, // half a business day
  HIGH: BUSINESS_MINUTES_PER_DAY, // 1 business day
  MEDIUM: BUSINESS_MINUTES_PER_DAY * 2, // 2 business days
  LOW: BUSINESS_MINUTES_PER_DAY * 5, // 5 business days
};

const ACTIVE_STATUSES: Status[] = ["OPEN", "IN_PROGRESS", "PENDING"];

export function isActive(status: Status): boolean {
  return ACTIVE_STATUSES.includes(status);
}

function startOfBusinessDay(d: Date): Date {
  const l = toLocal(d);
  return fromLocal(
    l.getUTCFullYear(),
    l.getUTCMonth(),
    l.getUTCDate(),
    BUSINESS_START_HOUR
  );
}

function endOfBusinessDay(d: Date): Date {
  const l = toLocal(d);
  return fromLocal(
    l.getUTCFullYear(),
    l.getUTCMonth(),
    l.getUTCDate(),
    BUSINESS_END_HOUR
  );
}

function nextDayStart(d: Date): Date {
  const l = toLocal(d);
  return fromLocal(
    l.getUTCFullYear(),
    l.getUTCMonth(),
    l.getUTCDate() + 1,
    BUSINESS_START_HOUR
  );
}

/** Advances `d` to the next instant that falls inside business hours. */
function clampToBusinessStart(d: Date): Date {
  let c = new Date(d);
  for (let i = 0; i < 31; i++) {
    const day = toLocal(c).getUTCDay(); // Lusaka weekday
    if (day === 0 || day === 6) {
      c = nextDayStart(c);
      continue;
    }
    const start = startOfBusinessDay(c);
    const end = endOfBusinessDay(c);
    if (c.getTime() < start.getTime()) return start;
    if (c.getTime() >= end.getTime()) {
      c = nextDayStart(c);
      continue;
    }
    return c;
  }
  return c;
}

/** Adds a number of business minutes to a start date, returning the due date. */
export function addBusinessMinutes(start: Date, minutes: number): Date {
  let c = clampToBusinessStart(start);
  let remaining = minutes;
  let guard = 0;
  while (remaining > 0 && guard++ < 2000) {
    const end = endOfBusinessDay(c);
    const availMin = (end.getTime() - c.getTime()) / 60000;
    if (availMin >= remaining) {
      c = new Date(c.getTime() + remaining * 60000);
      remaining = 0;
    } else {
      remaining -= availMin;
      c = clampToBusinessStart(new Date(end.getTime() + 60000));
    }
  }
  return c;
}

export function firstResponseDueAt(createdAt: Date, priority: Priority): Date {
  return addBusinessMinutes(createdAt, SLA_MINUTES[priority]);
}

export function resolutionDueAt(createdAt: Date, priority: Priority): Date {
  return addBusinessMinutes(createdAt, RESOLUTION_SLA_MINUTES[priority]);
}

/** First-response SLA breach (business-hours aware). */
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
  const due = firstResponseDueAt(ticket.createdAt, ticket.priority);
  if (ticket.firstResponseAt && ticket.firstResponseAt <= due) return false;
  return now > due;
}

/** Resolution SLA breach (business-hours aware). */
export function isResolutionBreached(
  ticket: { createdAt: Date; priority: Priority; status: Status },
  now: Date = new Date()
): boolean {
  if (!isActive(ticket.status)) return false;
  return now > resolutionDueAt(ticket.createdAt, ticket.priority);
}

/** Escalate a priority one level up (used by auto-escalation). */
export function escalatePriority(priority: Priority): Priority {
  const order: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const idx = order.indexOf(priority);
  return order[Math.min(idx + 1, order.length - 1)];
}

/** Human-friendly remaining/overdue string relative to a due date. */
export function formatDueLabel(due: Date, now: Date = new Date()): string {
  const diffMin = Math.round((due.getTime() - now.getTime()) / 60000);
  const abs = Math.abs(diffMin);
  const d = Math.floor(abs / (60 * 24));
  const h = Math.floor((abs % (60 * 24)) / 60);
  const m = abs % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (!d && m) parts.push(`${m}m`);
  const text = parts.join(" ") || "0m";
  return diffMin >= 0 ? `due in ${text}` : `overdue by ${text}`;
}

import { describe, it, expect } from "vitest";
import {
  SLA_MINUTES,
  addBusinessMinutes,
  firstResponseDueAt,
  resolutionDueAt,
  isSlaBreached,
  isResolutionBreached,
  isActive,
  escalatePriority,
  formatDueLabel,
} from "./sla";

// Business hours are 09:00–17:00 Lusaka time (UTC+2), i.e. 07:00–15:00 UTC.
// 2024-01-01 is a Monday; 07:00 UTC == 09:00 Lusaka (start of business).
const mon9 = new Date("2024-01-01T07:00:00Z");

describe("addBusinessMinutes", () => {
  it("adds minutes within the same business day", () => {
    const due = addBusinessMinutes(mon9, 60);
    expect(due.toISOString()).toBe("2024-01-01T08:00:00.000Z"); // 10:00 Lusaka
  });

  it("fills exactly to end of business day at the boundary", () => {
    // 09:00 + 480 business min = 17:00 Lusaka = 15:00 UTC
    const due = addBusinessMinutes(mon9, SLA_MINUTES.MEDIUM);
    expect(due.toISOString()).toBe("2024-01-01T15:00:00.000Z");
  });

  it("rolls into the next business day when it overflows the boundary", () => {
    // 09:00 + 481 min -> Tue 09:01 Lusaka = 07:01 UTC
    const due = addBusinessMinutes(mon9, SLA_MINUTES.MEDIUM + 1);
    expect(due.toISOString()).toBe("2024-01-02T07:01:00.000Z");
  });

  it("clamps a start time before business hours to 09:00 Lusaka", () => {
    // 04:00 UTC = 06:00 Lusaka (before start) -> clamps to 07:00 UTC (09:00 Lusaka)
    const due = addBusinessMinutes(new Date("2024-01-01T04:00:00Z"), 60);
    expect(due.toISOString()).toBe("2024-01-01T08:00:00.000Z");
  });

  it("skips weekends", () => {
    // Friday 2024-01-05 16:30 Lusaka (14:30 UTC) + 60 business min
    // 30 min left Fri (to 17:00 Lusaka), 30 min into Mon -> Mon 09:30 Lusaka = 07:30 UTC
    const due = addBusinessMinutes(new Date("2024-01-05T14:30:00Z"), 60);
    expect(due.toISOString()).toBe("2024-01-08T07:30:00.000Z");
  });
});

describe("due-date helpers", () => {
  it("computes first-response and resolution due dates", () => {
    expect(firstResponseDueAt(mon9, "URGENT").toISOString()).toBe(
      "2024-01-01T08:00:00.000Z"
    );
    expect(resolutionDueAt(mon9, "URGENT").toISOString()).toBe(
      "2024-01-01T11:00:00.000Z"
    );
  });
});

describe("isActive", () => {
  it("only counts open/in-progress/pending as active", () => {
    expect(isActive("OPEN")).toBe(true);
    expect(isActive("RESOLVED")).toBe(false);
    expect(isActive("CLOSED")).toBe(false);
  });
});

describe("isSlaBreached", () => {
  it("is breached when active and past the first-response due time", () => {
    const now = new Date("2024-01-01T09:00:00Z"); // due was 08:00 UTC
    expect(
      isSlaBreached(
        { createdAt: mon9, priority: "URGENT", status: "OPEN", firstResponseAt: null },
        now
      )
    ).toBe(true);
  });

  it("is not breached within the window", () => {
    const now = new Date("2024-01-01T07:30:00Z");
    expect(
      isSlaBreached(
        { createdAt: mon9, priority: "URGENT", status: "OPEN", firstResponseAt: null },
        now
      )
    ).toBe(false);
  });

  it("is not breached when responded before the due time", () => {
    const now = new Date("2024-01-01T13:00:00Z");
    expect(
      isSlaBreached(
        {
          createdAt: mon9,
          priority: "URGENT",
          status: "IN_PROGRESS",
          firstResponseAt: new Date("2024-01-01T07:30:00Z"),
        },
        now
      )
    ).toBe(false);
  });

  it("is never breached once resolved/closed", () => {
    const now = new Date("2024-01-05T09:00:00Z");
    expect(
      isSlaBreached(
        { createdAt: mon9, priority: "URGENT", status: "RESOLVED", firstResponseAt: null },
        now
      )
    ).toBe(false);
  });
});

describe("isResolutionBreached", () => {
  it("is breached past the resolution due time", () => {
    const now = new Date("2024-01-01T12:00:00Z"); // urgent resolution due 11:00 UTC
    expect(
      isResolutionBreached(
        { createdAt: mon9, priority: "URGENT", status: "OPEN" },
        now
      )
    ).toBe(true);
  });
});

describe("escalatePriority", () => {
  it("bumps priority up one level, capping at URGENT", () => {
    expect(escalatePriority("LOW")).toBe("MEDIUM");
    expect(escalatePriority("HIGH")).toBe("URGENT");
    expect(escalatePriority("URGENT")).toBe("URGENT");
  });
});

describe("formatDueLabel", () => {
  it("labels upcoming and overdue", () => {
    const now = new Date("2024-01-01T09:00:00Z");
    expect(formatDueLabel(new Date("2024-01-01T11:00:00Z"), now)).toBe("due in 2h");
    expect(formatDueLabel(new Date("2024-01-01T08:00:00Z"), now)).toBe(
      "overdue by 1h"
    );
  });
});

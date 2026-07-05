import { describe, it, expect } from "vitest";
import { SLA_MINUTES, slaDueAt, isSlaBreached, isActive } from "./sla";

describe("slaDueAt", () => {
  it("adds the priority window to the creation time", () => {
    const created = new Date("2024-01-01T00:00:00Z");
    const due = slaDueAt(created, "URGENT");
    expect(due.getTime() - created.getTime()).toBe(SLA_MINUTES.URGENT * 60_000);
  });
});

describe("isActive", () => {
  it("only counts open/in-progress/pending as active", () => {
    expect(isActive("OPEN")).toBe(true);
    expect(isActive("IN_PROGRESS")).toBe(true);
    expect(isActive("PENDING")).toBe(true);
    expect(isActive("RESOLVED")).toBe(false);
    expect(isActive("CLOSED")).toBe(false);
  });
});

describe("isSlaBreached", () => {
  const created = new Date("2024-01-01T00:00:00Z");

  it("is breached when active and past due with no response", () => {
    const now = new Date(created.getTime() + 2 * 60 * 60 * 1000); // +2h
    expect(
      isSlaBreached(
        { createdAt: created, priority: "URGENT", status: "OPEN", firstResponseAt: null },
        now
      )
    ).toBe(true);
  });

  it("is not breached when within the window", () => {
    const now = new Date(created.getTime() + 30 * 60 * 1000); // +30m
    expect(
      isSlaBreached(
        { createdAt: created, priority: "URGENT", status: "OPEN", firstResponseAt: null },
        now
      )
    ).toBe(false);
  });

  it("is not breached when responded within the window", () => {
    const responded = new Date(created.getTime() + 30 * 60 * 1000);
    const now = new Date(created.getTime() + 5 * 60 * 60 * 1000);
    expect(
      isSlaBreached(
        {
          createdAt: created,
          priority: "URGENT",
          status: "IN_PROGRESS",
          firstResponseAt: responded,
        },
        now
      )
    ).toBe(false);
  });

  it("is never breached once resolved or closed", () => {
    const now = new Date(created.getTime() + 100 * 60 * 60 * 1000);
    expect(
      isSlaBreached(
        { createdAt: created, priority: "URGENT", status: "RESOLVED", firstResponseAt: null },
        now
      )
    ).toBe(false);
  });
});

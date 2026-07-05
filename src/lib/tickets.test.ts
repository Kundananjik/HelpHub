import { describe, it, expect } from "vitest";
import { buildTicketWhere, ticketOrderBy } from "./tickets";

describe("buildTicketWhere", () => {
  it("scopes employees to their own tickets", () => {
    const where = buildTicketWhere("u1", "EMPLOYEE", {});
    expect(where.creatorId).toBe("u1");
  });

  it("does not scope staff to a creator", () => {
    const where = buildTicketWhere("u1", "TECHNICIAN", {});
    expect(where.creatorId).toBeUndefined();
  });

  it("applies status/priority/category/department filters", () => {
    const where = buildTicketWhere("u1", "ADMIN", {
      status: "OPEN",
      priority: "HIGH",
      category: "NETWORK",
      departmentId: "d1",
    });
    expect(where.status).toBe("OPEN");
    expect(where.priority).toBe("HIGH");
    expect(where.category).toBe("NETWORK");
    expect(where.departmentId).toBe("d1");
  });

  it("supports assignment filters for staff only", () => {
    const mine = buildTicketWhere("u1", "TECHNICIAN", { assignment: "me" });
    expect(mine.assigneeId).toBe("u1");
    const unassigned = buildTicketWhere("u1", "ADMIN", {
      assignment: "unassigned",
    });
    expect(unassigned.assigneeId).toBeNull();
  });

  it("ignores assignment filters for employees", () => {
    const where = buildTicketWhere("u1", "EMPLOYEE", { assignment: "me" });
    expect(where.assigneeId).toBeUndefined();
  });

  it("adds a case-insensitive search across title and description", () => {
    const where = buildTicketWhere("u1", "ADMIN", { q: "vpn" });
    expect(where.OR).toHaveLength(2);
  });
});

describe("ticketOrderBy", () => {
  it("returns priority-first ordering for priority sorts", () => {
    expect(ticketOrderBy("priority-high")[0]).toEqual({ priority: "desc" });
    expect(ticketOrderBy("priority-low")[0]).toEqual({ priority: "asc" });
  });

  it("defaults to recent (updatedAt desc)", () => {
    expect(ticketOrderBy("recent")).toEqual([{ updatedAt: "desc" }]);
  });

  it("supports oldest first", () => {
    expect(ticketOrderBy("oldest")).toEqual([{ createdAt: "asc" }]);
  });
});

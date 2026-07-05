import { describe, it, expect } from "vitest";
import {
  isStaff,
  canViewTicket,
  canCommentOnTicket,
  canPostInternalNote,
  evaluateEmployeeTicketUpdate,
  nextResolvedAt,
} from "./permissions";

describe("isStaff", () => {
  it("treats technicians and admins as staff", () => {
    expect(isStaff("TECHNICIAN")).toBe(true);
    expect(isStaff("ADMIN")).toBe(true);
    expect(isStaff("EMPLOYEE")).toBe(false);
  });
});

describe("canViewTicket", () => {
  it("lets staff view any ticket", () => {
    expect(canViewTicket("TECHNICIAN", "u1", "someone-else")).toBe(true);
    expect(canViewTicket("ADMIN", "u1", "someone-else")).toBe(true);
  });
  it("lets employees view only their own tickets", () => {
    expect(canViewTicket("EMPLOYEE", "u1", "u1")).toBe(true);
    expect(canViewTicket("EMPLOYEE", "u1", "u2")).toBe(false);
  });
});

describe("canCommentOnTicket", () => {
  it("allows staff and owners, denies unrelated employees", () => {
    expect(canCommentOnTicket("TECHNICIAN", "u1", "u2")).toBe(true);
    expect(canCommentOnTicket("EMPLOYEE", "u1", "u1")).toBe(true);
    expect(canCommentOnTicket("EMPLOYEE", "u1", "u2")).toBe(false);
  });
});

describe("canPostInternalNote", () => {
  it("only staff can post internal notes", () => {
    expect(canPostInternalNote("TECHNICIAN")).toBe(true);
    expect(canPostInternalNote("ADMIN")).toBe(true);
    expect(canPostInternalNote("EMPLOYEE")).toBe(false);
  });
});

describe("evaluateEmployeeTicketUpdate", () => {
  it("denies non-owners", () => {
    const res = evaluateEmployeeTicketUpdate({ status: "CLOSED" }, "RESOLVED", false);
    expect(res.allowed).toBe(false);
  });

  it("allows closing a resolved ticket", () => {
    const res = evaluateEmployeeTicketUpdate({ status: "CLOSED" }, "RESOLVED", true);
    expect(res.allowed).toBe(true);
  });

  it("rejects closing a non-resolved ticket", () => {
    const res = evaluateEmployeeTicketUpdate({ status: "CLOSED" }, "OPEN", true);
    expect(res).toEqual({
      allowed: false,
      reason: "Only resolved tickets can be closed.",
    });
  });

  it("allows reopening a closed ticket", () => {
    const res = evaluateEmployeeTicketUpdate({ status: "OPEN" }, "CLOSED", true);
    expect(res.allowed).toBe(true);
  });

  it("rejects reopening a non-closed ticket", () => {
    const res = evaluateEmployeeTicketUpdate({ status: "OPEN" }, "RESOLVED", true);
    expect(res.allowed).toBe(false);
  });

  it("rejects setting arbitrary statuses", () => {
    const res = evaluateEmployeeTicketUpdate({ status: "IN_PROGRESS" }, "OPEN", true);
    expect(res.allowed).toBe(false);
  });

  it("rejects changing fields other than status", () => {
    const res = evaluateEmployeeTicketUpdate(
      { status: "CLOSED", priority: "URGENT" },
      "RESOLVED",
      true
    );
    expect(res.allowed).toBe(false);
  });
});

describe("nextResolvedAt", () => {
  const existing = new Date("2024-01-01T00:00:00Z");

  it("sets resolvedAt when moving to RESOLVED", () => {
    const result = nextResolvedAt("RESOLVED", null);
    expect(result).toBeInstanceOf(Date);
  });

  it("keeps existing resolvedAt when already resolved", () => {
    expect(nextResolvedAt("RESOLVED", existing)).toBe(existing);
  });

  it("clears resolvedAt when reopening to an active status", () => {
    expect(nextResolvedAt("OPEN", existing)).toBeNull();
    expect(nextResolvedAt("IN_PROGRESS", existing)).toBeNull();
  });

  it("preserves resolvedAt when closing", () => {
    expect(nextResolvedAt("CLOSED", existing)).toBe(existing);
  });

  it("preserves resolvedAt when no status change", () => {
    expect(nextResolvedAt(undefined, existing)).toBe(existing);
  });
});

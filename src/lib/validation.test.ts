import { describe, it, expect } from "vitest";
import {
  registerSchema,
  ticketSchema,
  commentSchema,
  departmentSchema,
} from "./validation";

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const res = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "supersecret",
    });
    expect(res.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const res = registerSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "short",
    });
    expect(res.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const res = registerSchema.safeParse({
      name: "Jane",
      email: "not-an-email",
      password: "supersecret",
    });
    expect(res.success).toBe(false);
  });
});

describe("ticketSchema", () => {
  it("accepts a valid ticket", () => {
    const res = ticketSchema.safeParse({
      title: "Wifi is down",
      description: "It stopped working this morning.",
      category: "NETWORK",
      priority: "HIGH",
    });
    expect(res.success).toBe(true);
  });

  it("rejects invalid category/priority", () => {
    const res = ticketSchema.safeParse({
      title: "Wifi is down",
      description: "It stopped working this morning.",
      category: "NOPE",
      priority: "SUPER",
    });
    expect(res.success).toBe(false);
  });

  it("rejects too-short titles and descriptions", () => {
    const res = ticketSchema.safeParse({
      title: "hi",
      description: "short",
      category: "OTHER",
      priority: "LOW",
    });
    expect(res.success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("requires a non-empty body", () => {
    expect(commentSchema.safeParse({ body: "" }).success).toBe(false);
    expect(commentSchema.safeParse({ body: "Hello" }).success).toBe(true);
  });
});

describe("departmentSchema", () => {
  it("requires a name of at least 2 characters", () => {
    expect(departmentSchema.safeParse({ name: "A" }).success).toBe(false);
    expect(departmentSchema.safeParse({ name: "IT" }).success).toBe(true);
  });
});

import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { z } from "zod";

// List canned responses (staff only).
export async function GET() {
  const g = await guard("TECHNICIAN", "ADMIN");
  if ("response" in g) return g.response;

  const items = await prisma.cannedResponse.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, body: true },
  });
  return json({ items });
}

const schema = z.object({
  title: z.string().min(2).max(100),
  body: z.string().min(2).max(5000),
});

// Create a canned response (admin only).
export async function POST(req: Request) {
  const g = await guard("ADMIN");
  if ("response" in g) return g.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const created = await prisma.cannedResponse.create({
    data: { title: parsed.data.title, body: parsed.data.body },
    select: { id: true },
  });
  return json({ id: created.id }, 201);
}

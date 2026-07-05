import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { z } from "zod";
import { TAG_COLORS } from "@/lib/constants";

export async function GET() {
  const g = await guard();
  if ("response" in g) return g.response;
  const items = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true },
  });
  return json({ items });
}

const schema = z.object({
  name: z.string().min(1).max(40),
  color: z.enum(TAG_COLORS).optional(),
});

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
  if (!parsed.success) return error("Invalid input");

  const existing = await prisma.tag.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) return error("A tag with that name already exists.");

  const tag = await prisma.tag.create({
    data: { name: parsed.data.name, color: parsed.data.color ?? "slate" },
    select: { id: true },
  });
  return json({ id: tag.id }, 201);
}

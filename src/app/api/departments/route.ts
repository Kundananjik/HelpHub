import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { departmentSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const g = await guard("ADMIN");
  if ("response" in g) return g.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = departmentSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const existing = await prisma.department.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) return error("A department with that name already exists.");

  const dept = await prisma.department.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
    },
    select: { id: true },
  });

  return json({ id: dept.id }, 201);
}

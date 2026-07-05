import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { departmentSchema } from "@/lib/validation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;

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

  await prisma.department.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
    },
  });

  return json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;

  await prisma.department.delete({ where: { id } });
  return json({ ok: true });
}

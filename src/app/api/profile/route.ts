import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { profileSchema } from "@/lib/validation";

export async function PATCH(req: Request) {
  const g = await guard();
  if ("response" in g) return g.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const { name, jobTitle, phone, departmentId } = parsed.data;

  await prisma.user.update({
    where: { id: g.session.user.id },
    data: {
      name,
      jobTitle: jobTitle || null,
      phone: phone || null,
      departmentId: departmentId || null,
    },
  });

  return json({ ok: true });
}

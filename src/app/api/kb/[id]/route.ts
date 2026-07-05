import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { articleSchema } from "@/lib/validation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("TECHNICIAN", "ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category || null,
      published: parsed.data.published ?? true,
    },
    select: { slug: true },
  });

  return json({ slug: article.slug });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("TECHNICIAN", "ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return json({ ok: true });
}

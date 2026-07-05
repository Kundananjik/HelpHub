import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { articleSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

// Create a knowledge-base article (staff only).
export async function POST(req: Request) {
  const g = await guard("TECHNICIAN", "ADMIN");
  if ("response" in g) return g.response;

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

  let slug = slugify(parsed.data.title) || "article";
  // Ensure uniqueness.
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const article = await prisma.article.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category || null,
      published: parsed.data.published ?? true,
      slug,
      authorId: g.session.user.id,
    },
    select: { slug: true },
  });

  return json({ slug: article.slug }, 201);
}

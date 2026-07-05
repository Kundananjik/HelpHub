import { prisma } from "@/lib/prisma";
import { guard, json, error } from "@/lib/api";
import { ticketSchema } from "@/lib/validation";

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2MB per file (base64 stored)

export async function POST(req: Request) {
  const g = await guard();
  if ("response" in g) return g.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const parsed = ticketSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { title, description, category, priority, departmentId, attachments } =
    parsed.data;

  // Non-admins cannot self-assign priority above HIGH silently is fine; allow all.
  if (attachments) {
    for (const a of attachments) {
      if (a.data.length > MAX_ATTACHMENT_BYTES * 1.4) {
        return error(`Attachment "${a.filename}" is too large (max 2MB).`);
      }
    }
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      category,
      priority,
      departmentId: departmentId || null,
      creatorId: g.session.user.id,
      attachments: attachments?.length
        ? {
            create: attachments.map((a) => ({
              filename: a.filename,
              contentType: a.contentType,
              data: a.data,
            })),
          }
        : undefined,
    },
    select: { id: true },
  });

  return json({ id: ticket.id }, 201);
}

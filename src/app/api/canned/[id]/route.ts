import { prisma } from "@/lib/prisma";
import { guard, json } from "@/lib/api";

// Delete a canned response (admin only).
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guard("ADMIN");
  if ("response" in g) return g.response;
  const { id } = await params;
  await prisma.cannedResponse.delete({ where: { id } });
  return json({ ok: true });
}

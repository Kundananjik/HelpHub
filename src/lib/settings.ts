import { prisma } from "@/lib/prisma";

export const SETTING_KEYS = {
  autoAssign: "autoAssignEnabled",
} as const;

export async function getSetting(
  key: string,
  fallback = ""
): Promise<string> {
  const row = await prisma.systemSetting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function isAutoAssignEnabled(): Promise<boolean> {
  return (await getSetting(SETTING_KEYS.autoAssign, "false")) === "true";
}

/**
 * Picks the technician with the fewest active (unresolved) tickets for
 * load-balanced auto-assignment. Returns null when no technicians exist.
 */
export async function pickTechnicianForAssignment(): Promise<string | null> {
  const techs = await prisma.user.findMany({
    where: { role: "TECHNICIAN" },
    select: { id: true },
  });
  if (techs.length === 0) return null;

  const counts = await prisma.ticket.groupBy({
    by: ["assigneeId"],
    where: {
      assigneeId: { in: techs.map((t) => t.id) },
      status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] },
    },
    _count: true,
  });
  const load = new Map<string, number>();
  for (const t of techs) load.set(t.id, 0);
  for (const c of counts) {
    if (c.assigneeId) load.set(c.assigneeId, c._count);
  }

  let best: string | null = null;
  let bestCount = Infinity;
  for (const [id, count] of load) {
    if (count < bestCount) {
      best = id;
      bestCount = count;
    }
  }
  return best;
}

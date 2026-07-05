import { prisma } from "@/lib/prisma";
import type { Category } from "@prisma/client";

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
 * Picks a technician for auto-assignment, preferring department and skill
 * (category) match, then balancing by active-ticket load within the best-matched
 * group. Preference order:
 *   1. Same department AND handles the ticket's category
 *   2. Same department
 *   3. Handles the ticket's category (any department)
 *   4. Any technician
 * Within the chosen group, the technician with the fewest active tickets wins.
 * Returns null when no technicians exist.
 */
export async function pickTechnicianForAssignment(match?: {
  departmentId?: string | null;
  category?: Category;
}): Promise<string | null> {
  const techs = await prisma.user.findMany({
    where: { role: "TECHNICIAN" },
    select: { id: true, departmentId: true, skills: true },
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
  for (const c of counts) if (c.assigneeId) load.set(c.assigneeId, c._count);

  const inDept = (t: (typeof techs)[number]) =>
    !!match?.departmentId && t.departmentId === match.departmentId;
  const hasSkill = (t: (typeof techs)[number]) =>
    !!match?.category && t.skills.includes(match.category);

  const tiers: (typeof techs)[] = [
    techs.filter((t) => inDept(t) && hasSkill(t)),
    techs.filter((t) => inDept(t)),
    techs.filter((t) => hasSkill(t)),
    techs,
  ];

  for (const tier of tiers) {
    if (tier.length === 0) continue;
    let best: string | null = null;
    let bestCount = Infinity;
    for (const t of tier) {
      const count = load.get(t.id) ?? 0;
      if (count < bestCount) {
        best = t.id;
        bestCount = count;
      }
    }
    if (best) return best;
  }
  return null;
}

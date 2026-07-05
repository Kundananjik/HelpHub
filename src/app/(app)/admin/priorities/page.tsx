import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/ui/Badge";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/constants";
import type { Priority } from "@prisma/client";

const PRIORITY_META: Record<
  Priority,
  { sla: string; description: string }
> = {
  URGENT: {
    sla: "1 hour",
    description:
      "Critical outage affecting many users or business-critical systems. Immediate response required.",
  },
  HIGH: {
    sla: "4 hours",
    description:
      "Significant impact on an individual or team with no reasonable workaround.",
  },
  MEDIUM: {
    sla: "1 business day",
    description:
      "Standard requests and issues with a workaround available.",
  },
  LOW: {
    sla: "3 business days",
    description: "Minor issues, questions, and non-urgent requests.",
  },
};

export default async function PrioritiesPage() {
  await requireRole("ADMIN");

  const byPriority = await prisma.ticket.groupBy({
    by: ["priority"],
    _count: true,
    where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
  });

  const openCount = (p: Priority) =>
    byPriority.find((g) => g.priority === p)?._count ?? 0;

  return (
    <div>
      <PageHeader
        title="Priorities"
        description="Configure how priorities map to response targets (SLAs)."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {PRIORITIES.map((p) => (
          <Card key={p} className="p-5">
            <div className="flex items-center justify-between">
              <PriorityBadge priority={p} />
              <span className="text-sm font-medium text-slate-500">
                {openCount(p)} open
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-800">
              {PRIORITY_LABELS[p]}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {PRIORITY_META[p].description}
            </p>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Target response
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {PRIORITY_META[p].sla}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-400">
        Priority levels are applied to every ticket. Technicians and admins can
        change a ticket&apos;s priority from the ticket detail page. Response
        targets shown here define the expected first-response SLA for each level.
      </p>
    </div>
  );
}

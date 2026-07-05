import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { DonutChart, VerticalBarChart } from "@/components/app/Charts";
import {
  STATUSES,
  PRIORITIES,
  CATEGORIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
} from "@/lib/constants";
import { TicketIcon, CheckIcon, ClockIcon, UsersIcon } from "@/components/icons";

export default async function AnalyticsPage() {
  await requireRole("ADMIN");

  const [
    byStatus,
    byPriority,
    byCategory,
    byDept,
    totalTickets,
    resolved,
    unassigned,
    technicians,
  ] = await Promise.all([
    prisma.ticket.groupBy({ by: ["status"], _count: true }),
    prisma.ticket.groupBy({ by: ["priority"], _count: true }),
    prisma.ticket.groupBy({ by: ["category"], _count: true }),
    prisma.department.findMany({
      select: { name: true, _count: { select: { tickets: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.ticket.count({ where: { assigneeId: null } }),
    prisma.user.count({ where: { role: "TECHNICIAN" } }),
  ]);

  const statusData = STATUSES.map((s) => ({
    name: STATUS_LABELS[s],
    value: byStatus.find((g) => g.status === s)?._count ?? 0,
  }));
  const priorityData = PRIORITIES.map((p) => ({
    name: PRIORITY_LABELS[p],
    value: byPriority.find((g) => g.priority === p)?._count ?? 0,
  }));
  const categoryData = CATEGORIES.map((c) => ({
    name: CATEGORY_LABELS[c],
    value: byCategory.find((g) => g.category === c)?._count ?? 0,
  }));
  const deptData = byDept.map((d) => ({ name: d.name, value: d._count.tickets }));

  const resolutionRate =
    totalTickets > 0 ? Math.round((resolved / totalTickets) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Trends across status, priority, category, and departments."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total tickets"
          value={totalTickets}
          icon={<TicketIcon />}
          accent="indigo"
        />
        <StatCard
          label="Resolution rate"
          value={`${resolutionRate}%`}
          icon={<CheckIcon />}
          accent="emerald"
        />
        <StatCard
          label="Unassigned"
          value={unassigned}
          icon={<ClockIcon />}
          accent="amber"
        />
        <StatCard
          label="Technicians"
          value={technicians}
          icon={<UsersIcon />}
          accent="sky"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tickets by status" />
          <div className="p-4">
            <DonutChart data={statusData} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Tickets by priority" />
          <div className="p-4">
            <VerticalBarChart data={priorityData} color="#f59e0b" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Tickets by category" />
          <div className="p-4">
            <VerticalBarChart data={categoryData} color="#10b981" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Tickets by department" />
          <div className="p-4">
            <VerticalBarChart data={deptData} color="#6366f1" />
          </div>
        </Card>
      </div>
    </div>
  );
}

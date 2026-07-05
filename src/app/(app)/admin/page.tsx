import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { DonutChart, VerticalBarChart } from "@/components/app/Charts";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/utils";
import { STATUS_LABELS, STATUSES } from "@/lib/constants";
import {
  UsersIcon,
  TicketIcon,
  AlertIcon,
  CheckIcon,
} from "@/components/icons";

export default async function AdminDashboard() {
  await requireRole("ADMIN");

  const [
    totalUsers,
    totalTickets,
    openTickets,
    resolvedTickets,
    byStatus,
    byDept,
    recent,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.ticket.count(),
    prisma.ticket.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] } },
    }),
    prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.ticket.groupBy({ by: ["status"], _count: true }),
    prisma.department.findMany({
      select: { name: true, _count: { select: { tickets: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.auditLog.findMany({
      select: {
        id: true,
        action: true,
        summary: true,
        createdAt: true,
        ticketId: true,
        actor: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const statusData = STATUSES.map((s) => ({
    name: STATUS_LABELS[s],
    value: byStatus.find((g) => g.status === s)?._count ?? 0,
  }));

  const deptData = byDept.map((d) => ({
    name: d.name,
    value: d._count.tickets,
  }));

  return (
    <div>
      <PageHeader
        title="Admin overview"
        description="System-wide analytics and recent activity."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={totalUsers}
          icon={<UsersIcon />}
          accent="indigo"
        />
        <StatCard
          label="Total tickets"
          value={totalTickets}
          icon={<TicketIcon />}
          accent="sky"
        />
        <StatCard
          label="Open tickets"
          value={openTickets}
          icon={<AlertIcon />}
          accent="amber"
        />
        <StatCard
          label="Resolved"
          value={resolvedTickets}
          icon={<CheckIcon />}
          accent="emerald"
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
          <CardHeader title="Tickets by department" />
          <div className="p-4">
            <VerticalBarChart data={deptData} />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Recent activity"
            action={
              <Link
                href="/tickets"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                All tickets
              </Link>
            }
          />
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-slate-400">
                No activity yet.
              </li>
            )}
            {recent.map((log) => {
              const row = (
                <div className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={log.actor?.name ?? "System"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {log.summary}
                    </p>
                    <p className="text-xs text-slate-400">
                      {log.actor?.name ?? "System"} · {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              );
              return log.ticketId ? (
                <li key={log.id}>
                  <Link
                    href={`/tickets/${log.ticketId}`}
                    className="block hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {row}
                  </Link>
                </li>
              ) : (
                <li key={log.id}>{row}</li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { TicketTable } from "@/components/app/TicketTable";
import { UnassignedQueue } from "@/components/app/UnassignedQueue";
import { ticketRowSelect } from "@/lib/tickets";
import { AlertIcon, CheckIcon, ClockIcon, InboxIcon } from "@/components/icons";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function TechnicianDashboard() {
  const session = await requireRole("TECHNICIAN", "ADMIN");
  const me = session.user.id;
  const today = startOfToday();

  const [
    assignedOpen,
    highPriority,
    resolvedByMe,
    resolvedToday,
    totalAssigned,
    myTickets,
    unassigned,
  ] = await Promise.all([
    prisma.ticket.count({
      where: {
        assigneeId: me,
        status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] },
      },
    }),
    prisma.ticket.count({
      where: {
        assigneeId: me,
        priority: { in: ["HIGH", "URGENT"] },
        status: { notIn: ["RESOLVED", "CLOSED"] },
      },
    }),
    prisma.ticket.count({
      where: { assigneeId: me, status: { in: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.ticket.count({
      where: {
        assigneeId: me,
        resolvedAt: { gte: today },
      },
    }),
    prisma.ticket.count({ where: { assigneeId: me } }),
    prisma.ticket.findMany({
      where: {
        assigneeId: me,
        status: { notIn: ["CLOSED"] },
      },
      select: ticketRowSelect,
      orderBy: [{ updatedAt: "desc" }],
      take: 8,
    }),
    prisma.ticket.findMany({
      where: { assigneeId: null, status: { notIn: ["CLOSED", "RESOLVED"] } },
      select: {
        id: true,
        number: true,
        title: true,
        priority: true,
        category: true,
        createdAt: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: 6,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title={`Technician workspace`}
        description={`Welcome back, ${session.user.name?.split(" ")[0] ?? ""}. Here's your queue.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Assigned & open"
          value={assignedOpen}
          icon={<InboxIcon />}
          accent="sky"
        />
        <StatCard
          label="High priority"
          value={highPriority}
          icon={<AlertIcon />}
          accent="red"
        />
        <StatCard
          label="Resolved today"
          value={resolvedToday}
          icon={<ClockIcon />}
          accent="amber"
          hint="Since midnight"
        />
        <StatCard
          label="Total resolved"
          value={resolvedByMe}
          icon={<CheckIcon />}
          accent="emerald"
          hint={`${totalAssigned} assigned all-time`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              My active tickets
            </h2>
            <Link
              href="/tickets?assignment=me"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <TicketTable
            tickets={myTickets}
            emptyTitle="No active tickets"
            emptyDescription="You have no open tickets assigned. Grab one from the queue."
          />
        </div>

        <div>
          <UnassignedQueue items={unassigned} />
        </div>
      </div>
    </div>
  );
}

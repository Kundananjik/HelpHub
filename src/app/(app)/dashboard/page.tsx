import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { TicketTable } from "@/components/app/TicketTable";
import { ticketRowSelect } from "@/lib/tickets";
import {
  TicketIcon,
  CheckIcon,
  ClockIcon,
  InboxIcon,
  PlusIcon,
} from "@/components/icons";

export default async function EmployeeDashboard() {
  const session = await requireRole("EMPLOYEE");
  const userId = session.user.id;

  const [grouped, recent] = await Promise.all([
    prisma.ticket.groupBy({
      by: ["status"],
      where: { creatorId: userId },
      _count: true,
    }),
    prisma.ticket.findMany({
      where: { creatorId: userId },
      select: ticketRowSelect,
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const countBy = (statuses: string[]) =>
    grouped
      .filter((g) => statuses.includes(g.status))
      .reduce((sum, g) => sum + g._count, 0);

  const open = countBy(["OPEN", "IN_PROGRESS"]);
  const pending = countBy(["PENDING"]);
  const resolved = countBy(["RESOLVED"]);
  const total = grouped.reduce((s, g) => s + g._count, 0);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${session.user.name?.split(" ")[0] ?? "there"}`}
        description="Here's an overview of your support tickets."
        action={
          <Link href="/tickets/new">
            <Button>
              <PlusIcon className="h-4 w-4" /> New ticket
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total tickets"
          value={total}
          icon={<TicketIcon />}
          accent="indigo"
        />
        <StatCard
          label="Open"
          value={open}
          icon={<InboxIcon />}
          accent="sky"
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={<ClockIcon />}
          accent="amber"
        />
        <StatCard
          label="Resolved"
          value={resolved}
          icon={<CheckIcon />}
          accent="emerald"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent tickets
          </h2>
          <Link
            href="/tickets"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
        <TicketTable
          tickets={recent}
          emptyTitle="No tickets yet"
          emptyDescription="Submit your first IT support ticket to get help."
          emptyAction={
            <Link href="/tickets/new">
              <Button>
                <PlusIcon className="h-4 w-4" /> New ticket
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}

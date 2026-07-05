import Link from "next/link";
import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import {
  getTicketsPage,
  type TicketFilters as Filters,
  type TicketSort,
} from "@/lib/tickets";
import { PageHeader } from "@/components/app/PageHeader";
import { TicketFilters } from "@/components/app/TicketFilters";
import { TicketTable } from "@/components/app/TicketTable";
import { Pagination } from "@/components/app/Pagination";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/icons";
import type { Status, Priority, Category } from "@prisma/client";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAuth();
  const sp = await searchParams;
  const role = session.user.role;

  const str = (v: string | string[] | undefined) =>
    typeof v === "string" && v ? v : undefined;

  const filters: Filters = {
    q: str(sp.q),
    status: str(sp.status) as Status | undefined,
    priority: str(sp.priority) as Priority | undefined,
    category: str(sp.category) as Category | undefined,
    departmentId: str(sp.departmentId),
    assignment: str(sp.assignment) as Filters["assignment"],
  };

  const sort = (str(sp.sort) as TicketSort) ?? "recent";
  const page = Number(str(sp.page) ?? "1") || 1;

  const [result, departments] = await Promise.all([
    getTicketsPage(session.user.id, role, filters, { page, sort }),
    role === "EMPLOYEE"
      ? Promise.resolve([])
      : prisma.department.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
  ]);

  const isEmployee = role === "EMPLOYEE";

  return (
    <div>
      <PageHeader
        title={isEmployee ? "My Tickets" : "All Tickets"}
        description={
          isEmployee
            ? "All the support tickets you've submitted."
            : "Browse, search, and filter every ticket in the system."
        }
        action={
          isEmployee ? (
            <Link href="/tickets/new">
              <Button>
                <PlusIcon className="h-4 w-4" /> New ticket
              </Button>
            </Link>
          ) : undefined
        }
      />

      <TicketFilters
        showAssignment={!isEmployee}
        departments={departments}
      />

      <TicketTable tickets={result.items} />

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}

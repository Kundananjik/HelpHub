import { guard, error } from "@/lib/api";
import { getTickets, type TicketFilters } from "@/lib/tickets";
import { ticketNumber, formatDateTime } from "@/lib/utils";
import type { Status, Priority, Category } from "@prisma/client";

function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Exports tickets (respecting role scope + filters) as a CSV download.
export async function GET(req: Request) {
  const g = await guard();
  if ("response" in g) return g.response;

  const url = new URL(req.url);
  const str = (k: string) => url.searchParams.get(k) || undefined;
  const filters: TicketFilters = {
    q: str("q"),
    status: str("status") as Status | undefined,
    priority: str("priority") as Priority | undefined,
    category: str("category") as Category | undefined,
    departmentId: str("departmentId"),
    assignment: str("assignment") as TicketFilters["assignment"],
  };

  const tickets = await getTickets(g.session.user.id, g.session.user.role, filters);

  const header = [
    "Number",
    "Title",
    "Status",
    "Priority",
    "Category",
    "Department",
    "Requester",
    "Assignee",
    "Comments",
    "Updated",
  ];
  const rows = tickets.map((t) =>
    [
      ticketNumber(t.number),
      t.title,
      t.status,
      t.priority,
      t.category,
      t.department?.name ?? "",
      t.creator.name,
      t.assignee?.name ?? "",
      t._count?.comments ?? 0,
      formatDateTime(t.updatedAt),
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  if (!csv) return error("Nothing to export");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="helphub-tickets-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

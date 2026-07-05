import Link from "next/link";
import {
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
} from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ticketNumber, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { TicketIcon } from "@/components/icons";

export type TicketRow = {
  id: string;
  number: number;
  title: string;
  status: import("@prisma/client").Status;
  priority: import("@prisma/client").Priority;
  category: import("@prisma/client").Category;
  updatedAt: Date;
  creator: { name: string };
  assignee: { name: string } | null;
  department: { name: string } | null;
  _count?: { comments: number };
};

export function TicketTable({
  tickets,
  emptyTitle = "No tickets found",
  emptyDescription = "There are no tickets matching your filters.",
  emptyAction,
}: {
  tickets: TicketRow[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<TicketIcon />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ticket
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assignee
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <tr key={t.id} className="group hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/tickets/${t.id}`} className="block">
                    <span className="font-mono text-xs text-slate-400">
                      {ticketNumber(t.number)}
                    </span>
                    <p className="font-medium text-slate-800 group-hover:text-indigo-600">
                      {t.title}
                    </p>
                    <span className="text-xs text-slate-400">
                      {t.department?.name ?? "Unassigned dept"} ·{" "}
                      {t._count?.comments ?? 0} comments
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge category={t.category} />
                </td>
                <td className="px-4 py-3">
                  {t.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={t.assignee.name} size="sm" />
                      <span className="text-sm text-slate-600">
                        {t.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {timeAgo(t.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {tickets.map((t) => (
          <Link
            key={t.id}
            href={`/tickets/${t.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">
                {ticketNumber(t.number)}
              </span>
              <StatusBadge status={t.status} />
            </div>
            <p className="mt-1 font-medium text-slate-800">{t.title}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PriorityBadge priority={t.priority} />
              <CategoryBadge category={t.category} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                {t.assignee ? `Assigned: ${t.assignee.name}` : "Unassigned"}
              </span>
              <span>{timeAgo(t.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

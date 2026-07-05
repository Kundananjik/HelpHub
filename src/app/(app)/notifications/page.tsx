import Link from "next/link";
import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { BellIcon } from "@/components/icons";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await requireAuth();

  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Updates on your tickets and account."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<BellIcon />}
          title="No notifications"
          description="You're all caught up. New activity on your tickets will appear here."
        />
      ) : (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((n) => {
            const inner = (
              <div
                className={cn(
                  "flex items-start gap-3 px-5 py-4",
                  !n.read && "bg-indigo-50/40 dark:bg-indigo-500/10"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    n.read ? "bg-slate-300 dark:bg-slate-600" : "bg-indigo-500"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              </div>
            );
            return n.ticketId ? (
              <Link
                key={n.id}
                href={`/tickets/${n.ticketId}`}
                className="block hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

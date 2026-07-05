import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import {
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
} from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { ticketNumber, formatDateTime, timeAgo } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { firstResponseDueAt, resolutionDueAt, isActive } from "@/lib/sla";
import { SlaCountdown } from "@/components/app/SlaCountdown";
import { EditableTicketContent } from "./EditableTicketContent";
import { SatisfactionRating } from "./SatisfactionRating";
import { TicketTags } from "./TicketTags";
import { TicketActions } from "./TicketActions";
import { CommentThread } from "./CommentThread";
import { AttachmentGallery } from "./AttachmentGallery";
import { ArrowLeftLink } from "./ArrowLeftLink";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;
  const { user } = session;
  const isStaff = user.role === "TECHNICIAN" || user.role === "ADMIN";

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
      attachments: {
        select: {
          id: true,
          filename: true,
          contentType: true,
          data: true,
          createdAt: true,
        },
      },
      tags: { select: { id: true, name: true, color: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) notFound();
  if (!isStaff && ticket.creatorId !== user.id) notFound();

  const [departments, technicians] = isStaff
    ? await Promise.all([
        prisma.department.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
        prisma.user.findMany({
          where: { role: { in: ["TECHNICIAN", "ADMIN"] } },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
      ])
    : [[], []];

  // Employees don't see internal troubleshooting notes.
  const visibleComments = ticket.comments.filter(
    (c) => isStaff || !c.isInternal
  );

  return (
    <div>
      <ArrowLeftLink />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-slate-400">
                {ticketNumber(ticket.number)}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryBadge category={ticket.category} />
            </div>
            <EditableTicketContent
              ticketId={ticket.id}
              title={ticket.title}
              description={ticket.description}
              canEdit={
                (isStaff || ticket.creatorId === user.id) &&
                ticket.status !== "CLOSED"
              }
            />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Opened by {ticket.creator.name} · {timeAgo(ticket.createdAt)}
            </p>

            {ticket.attachments.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Attachments ({ticket.attachments.length})
                </h3>
                <AttachmentGallery attachments={ticket.attachments} />
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title={`Comments & Activity (${visibleComments.length})`}
            />
            <CommentThread
              ticketId={ticket.id}
              comments={visibleComments.map((c) => ({
                id: c.id,
                body: c.body,
                isInternal: c.isInternal,
                createdAt: c.createdAt,
                author: c.author,
              }))}
              isStaff={isStaff}
              currentUserId={user.id}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Details" />
            <dl className="divide-y divide-slate-100 px-5 py-2 text-sm dark:divide-slate-800">
              <Detail label="Status">
                <StatusBadge status={ticket.status} />
              </Detail>
              <Detail label="Priority">
                <PriorityBadge priority={ticket.priority} />
              </Detail>
              <Detail label="Category">
                <CategoryBadge category={ticket.category} />
              </Detail>
              <Detail label="Department">
                <span className="text-slate-700 dark:text-slate-200">
                  {ticket.department?.name ?? "—"}
                </span>
              </Detail>
              <Detail label="Requester">
                <div className="flex items-center gap-2">
                  <Avatar name={ticket.creator.name} size="sm" />
                  <span className="text-slate-700 dark:text-slate-200">
                    {ticket.creator.name}
                  </span>
                </div>
              </Detail>
              <Detail label="Assignee">
                {ticket.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={ticket.assignee.name} size="sm" />
                    <span className="text-slate-700 dark:text-slate-200">
                      {ticket.assignee.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">Unassigned</span>
                )}
              </Detail>
              <Detail label="Created">
                <span className="text-slate-700 dark:text-slate-200">
                  {formatDateTime(ticket.createdAt)}
                </span>
              </Detail>
              <Detail label="Updated">
                <span className="text-slate-700 dark:text-slate-200">
                  {formatDateTime(ticket.updatedAt)}
                </span>
              </Detail>
              {ticket.resolvedAt && (
                <Detail label="Resolved">
                  <span className="text-slate-700 dark:text-slate-200">
                    {formatDateTime(ticket.resolvedAt)}
                  </span>
                </Detail>
              )}
            </dl>
          </Card>

          {isActive(ticket.status) && (
            <Card>
              <CardHeader title="Service level (SLA)" />
              <SlaCountdown
                firstResponseDue={firstResponseDueAt(
                  ticket.createdAt,
                  ticket.priority
                ).toISOString()}
                firstResponseMet={
                  !!ticket.firstResponseAt &&
                  ticket.firstResponseAt <=
                    firstResponseDueAt(ticket.createdAt, ticket.priority)
                }
                resolutionDue={resolutionDueAt(
                  ticket.createdAt,
                  ticket.priority
                ).toISOString()}
                resolutionMet={false}
              />
            </Card>
          )}

          <TicketTags
            ticketId={ticket.id}
            currentTags={ticket.tags}
            canEdit={isStaff}
          />

          <TicketActions
            ticketId={ticket.id}
            status={ticket.status}
            priority={ticket.priority}
            category={ticket.category}
            assigneeId={ticket.assignee?.id ?? null}
            departmentId={ticket.department?.id ?? null}
            isStaff={isStaff}
            isOwner={ticket.creatorId === user.id}
            currentUserId={user.id}
            technicians={technicians}
            departments={departments}
          />

          <SatisfactionRating
            ticketId={ticket.id}
            status={ticket.status}
            isOwner={ticket.creatorId === user.id}
            rating={ticket.satisfactionRating}
            comment={ticket.satisfactionComment}
            isStaff={isStaff}
          />

          <p className="px-1 text-xs text-slate-400">
            You are viewing as {ROLE_LABELS[user.role]}.
          </p>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export const dynamic = "force-dynamic";

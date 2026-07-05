import { prisma } from "@/lib/prisma";
import { sendEmail, ticketNotificationEmail } from "@/lib/email";
import { ticketNumber } from "@/lib/utils";

type NotifyArgs = {
  userIds: string[];
  type: string;
  message: string;
  ticketId?: string;
  // Email details (optional). When provided, an email is also sent.
  email?: {
    heading: string;
    ticketTitle: string;
    ticketNumberValue: number;
    body: string;
  };
};

/**
 * Creates in-app notifications for the given users and (optionally) emails them.
 * Deduplicates the user list and skips empty lists.
 */
export async function notifyUsers(args: NotifyArgs) {
  const userIds = [...new Set(args.userIds.filter(Boolean))];
  if (userIds.length === 0) return;

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: args.type,
      message: args.message,
      ticketId: args.ticketId ?? null,
    })),
  });

  if (args.email && args.ticketId) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { email: true },
    });
    const template = ticketNotificationEmail({
      heading: args.email.heading,
      ticketTitle: args.email.ticketTitle,
      ticketNumber: ticketNumber(args.email.ticketNumberValue),
      body: args.email.body,
      ticketId: args.ticketId,
    });
    await Promise.all(
      users.map((u) =>
        sendEmail({
          to: u.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        })
      )
    );
  }
}

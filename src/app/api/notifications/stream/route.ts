import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Server-Sent Events stream of the current user's unread notification count.
 * Streams for ~25s then closes; the browser's EventSource auto-reconnects,
 * which keeps it within serverless function duration limits while feeling
 * real-time (updates within a few seconds).
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let last = -1;
      let closed = false;

      const push = async () => {
        if (closed) return;
        try {
          const unread = await prisma.notification.count({
            where: { userId, read: false },
          });
          if (unread !== last) {
            last = unread;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ unread })}\n\n`)
            );
          } else {
            // heartbeat to keep the connection alive
            controller.enqueue(encoder.encode(": ping\n\n"));
          }
        } catch {
          /* ignore transient errors */
        }
      };

      await push();
      const interval = setInterval(push, 5000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        clearTimeout(timeout);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const timeout = setTimeout(cleanup, 25000);
      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

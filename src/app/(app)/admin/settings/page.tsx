import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { isAutoAssignEnabled } from "@/lib/settings";
import { BUSINESS_START_HOUR, BUSINESS_END_HOUR } from "@/lib/sla";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { SettingsForm } from "./SettingsForm";
import { CannedResponsesManager } from "./CannedResponsesManager";
import { TagsManager } from "./TagsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");
  const [autoAssign, canned, tags] = await Promise.all([
    isAutoAssignEnabled(),
    prisma.cannedResponse.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, body: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Settings"
        description="System-wide configuration."
      />

      <Card>
        <CardHeader title="Automation" />
        <div className="p-5">
          <SettingsForm autoAssign={autoAssign} />
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Ticket tags" />
        <div className="p-5">
          <TagsManager items={tags} />
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Canned responses" />
        <div className="p-5">
          <CannedResponsesManager items={canned} />
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Business hours & SLA" />
        <div className="space-y-2 p-5 text-sm text-slate-600 dark:text-slate-300">
          <p>
            SLA timers are measured in business hours:{" "}
            <span className="font-medium text-slate-800 dark:text-slate-100">
              Monday–Friday, {BUSINESS_START_HOUR}:00–{BUSINESS_END_HOUR}:00 UTC
            </span>
            . Time outside these hours (evenings and weekends) is not counted
            against SLA targets.
          </p>
          <p>
            First-response and resolution targets are defined per priority on the{" "}
            <Link
              href="/admin/priorities"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Priorities
            </Link>{" "}
            page. Breaches auto-escalate the ticket one priority level.
          </p>
        </div>
      </Card>
    </div>
  );
}

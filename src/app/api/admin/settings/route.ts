import { guard, json, error } from "@/lib/api";
import { setSetting, SETTING_KEYS } from "@/lib/settings";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  autoAssignEnabled: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const g = await guard("ADMIN");
  if ("response" in g) return g.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid input");

  if (parsed.data.autoAssignEnabled !== undefined) {
    await setSetting(
      SETTING_KEYS.autoAssign,
      String(parsed.data.autoAssignEnabled)
    );
    await logAudit({
      action: "settings.updated",
      summary: `Auto-assignment ${parsed.data.autoAssignEnabled ? "enabled" : "disabled"}`,
      actorId: g.session.user.id,
    });
  }

  return json({ ok: true });
}

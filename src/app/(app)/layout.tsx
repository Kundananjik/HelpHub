import { requireAuth } from "@/lib/guards";
import { AppShell } from "@/components/app/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  return (
    <AppShell
      user={{
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        role: session.user.role,
      }}
    >
      {children}
    </AppShell>
  );
}

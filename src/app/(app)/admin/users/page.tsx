import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { UsersTable } from "./UsersTable";

export default async function AdminUsersPage() {
  const session = await requireRole("ADMIN");

  const [users, departments] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        department: { select: { id: true, name: true } },
        _count: { select: { createdTickets: true, assignedTickets: true } },
      },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage accounts, assign technician roles, and set departments."
      />
      <UsersTable
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          departmentId: u.department?.id ?? null,
          departmentName: u.department?.name ?? null,
          createdTickets: u._count.createdTickets,
          assignedTickets: u._count.assignedTickets,
          createdAt: u.createdAt,
        }))}
        departments={departments}
        currentUserId={session.user.id}
      />
    </div>
  );
}

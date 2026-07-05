import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { DepartmentsManager } from "./DepartmentsManager";

export default async function AdminDepartmentsPage() {
  await requireRole("ADMIN");

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { members: true, tickets: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Organize your company into departments for routing tickets."
      />
      <DepartmentsManager
        departments={departments.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          members: d._count.members,
          tickets: d._count.tickets,
        }))}
      />
    </div>
  );
}

import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { NewTicketForm } from "./NewTicketForm";

export default async function NewTicketPage() {
  await requireRole("EMPLOYEE", "ADMIN", "TECHNICIAN");
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Submit a ticket"
        description="Describe your IT issue and our technicians will help you out."
      />
      <NewTicketForm departments={departments} />
    </div>
  );
}

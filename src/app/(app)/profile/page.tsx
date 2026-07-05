import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { ProfileForm } from "./ProfileForm";
import { Card, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await requireAuth();

  const [user, departments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        phone: true,
        departmentId: true,
        createdAt: true,
      },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Profile"
        description="Manage your personal information."
      />

      <Card className="mb-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {user.name}
            </h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <div className="ml-auto hidden text-right text-xs text-slate-400 sm:block">
            Member since
            <br />
            {formatDate(user.createdAt)}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Edit details" />
        <div className="p-6">
          <ProfileForm
            user={{
              name: user.name,
              jobTitle: user.jobTitle,
              phone: user.phone,
              departmentId: user.departmentId,
            }}
            departments={departments}
          />
        </div>
      </Card>
    </div>
  );
}

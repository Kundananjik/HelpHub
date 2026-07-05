"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navForRole } from "@/lib/nav";
import type { Role } from "@prisma/client";
import {
  DashboardIcon,
  TicketIcon,
  UsersIcon,
  BuildingIcon,
  ChartIcon,
  UserIcon,
  PlusIcon,
  LayersIcon,
} from "@/components/icons";

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  dashboard: DashboardIcon,
  ticket: TicketIcon,
  users: UsersIcon,
  building: BuildingIcon,
  chart: ChartIcon,
  user: UserIcon,
  plus: PlusIcon,
  layers: LayersIcon,
};

export function Sidebar({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? TicketIcon;
        const active =
          item.href === pathname ||
          (item.href !== "/tickets" &&
            item.href !== "/dashboard" &&
            item.href !== "/admin" &&
            item.href !== "/technician" &&
            pathname.startsWith(item.href)) ||
          (item.href === "/tickets" &&
            pathname.startsWith("/tickets") &&
            !pathname.startsWith("/tickets/new"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

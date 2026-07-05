import type { Role } from "@prisma/client";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export function navForRole(role: Role): NavItem[] {
  if (role === "ADMIN") {
    return [
      { label: "Dashboard", href: "/admin", icon: "dashboard" },
      { label: "All Tickets", href: "/tickets", icon: "ticket" },
      { label: "Users", href: "/admin/users", icon: "users" },
      { label: "Departments", href: "/admin/departments", icon: "building" },
      { label: "Priorities", href: "/admin/priorities", icon: "layers" },
      { label: "Analytics", href: "/admin/analytics", icon: "chart" },
      { label: "Knowledge Base", href: "/kb", icon: "book" },
      { label: "Settings", href: "/admin/settings", icon: "settings" },
      { label: "Profile", href: "/profile", icon: "user" },
    ];
  }
  if (role === "TECHNICIAN") {
    return [
      { label: "Dashboard", href: "/technician", icon: "dashboard" },
      { label: "Tickets", href: "/tickets", icon: "ticket" },
      { label: "Knowledge Base", href: "/kb", icon: "book" },
      { label: "Profile", href: "/profile", icon: "user" },
    ];
  }
  return [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Tickets", href: "/tickets", icon: "ticket" },
    { label: "New Ticket", href: "/tickets/new", icon: "plus" },
    { label: "Knowledge Base", href: "/kb", icon: "book" },
    { label: "Profile", href: "/profile", icon: "user" },
  ];
}

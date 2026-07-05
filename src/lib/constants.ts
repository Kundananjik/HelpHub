import type { Role, Priority, Status, Category } from "@prisma/client";

export const ROLES: Role[] = ["EMPLOYEE", "TECHNICIAN", "ADMIN"];
export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const STATUSES: Status[] = [
  "OPEN",
  "IN_PROGRESS",
  "PENDING",
  "RESOLVED",
  "CLOSED",
];
export const CATEGORIES: Category[] = [
  "HARDWARE",
  "SOFTWARE",
  "NETWORK",
  "ACCOUNT",
  "EMAIL",
  "SECURITY",
  "OTHER",
];

export const STATUS_LABELS: Record<Status, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  PENDING: "Pending",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  HARDWARE: "Hardware",
  SOFTWARE: "Software",
  NETWORK: "Network",
  ACCOUNT: "Account",
  EMAIL: "Email",
  SECURITY: "Security",
  OTHER: "Other",
};

export const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: "Employee",
  TECHNICIAN: "Technician",
  ADMIN: "Administrator",
};

export const STATUS_STYLES: Record<Status, string> = {
  OPEN: "bg-blue-100 text-blue-700 ring-blue-600/20",
  IN_PROGRESS: "bg-amber-100 text-amber-700 ring-amber-600/20",
  PENDING: "bg-purple-100 text-purple-700 ring-purple-600/20",
  RESOLVED: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  CLOSED: "bg-slate-200 text-slate-600 ring-slate-500/20",
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-600 ring-slate-500/20",
  MEDIUM: "bg-sky-100 text-sky-700 ring-sky-600/20",
  HIGH: "bg-orange-100 text-orange-700 ring-orange-600/20",
  URGENT: "bg-red-100 text-red-700 ring-red-600/20",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const CHART_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#a855f7",
  "#10b981",
  "#94a3b8",
  "#ef4444",
  "#0ea5e9",
];

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dashboardPathFor } from "@/lib/guards";
import { Footer } from "@/components/Footer";
import {
  TicketIcon,
  ChartIcon,
  UsersIcon,
  CheckIcon,
  AlertIcon,
  PaperclipIcon,
} from "@/components/icons";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect(dashboardPathFor(session.user.role));

  const features = [
    {
      icon: <TicketIcon />,
      title: "Submit & track tickets",
      body: "Employees raise IT issues in seconds and follow every update in real time.",
    },
    {
      icon: <UsersIcon />,
      title: "Technician workflows",
      body: "Assign, triage, and resolve tickets with troubleshooting notes and screenshots.",
    },
    {
      icon: <ChartIcon />,
      title: "Admin analytics",
      body: "Monitor volume by status, department, and priority with live dashboards.",
    },
    {
      icon: <AlertIcon />,
      title: "Priority routing",
      body: "Urgent incidents rise to the top so critical work never slips through.",
    },
    {
      icon: <PaperclipIcon />,
      title: "Rich attachments",
      body: "Add screenshots and context so tickets get resolved the first time.",
    },
    {
      icon: <CheckIcon />,
      title: "Role-based access",
      body: "Employees, technicians, and admins each get a tailored, secure workspace.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <TicketIcon />
          </span>
          <span className="text-lg font-bold text-slate-900">HelpHub</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 text-center">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
            Lightweight IT Service Desk
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            IT support that actually feels{" "}
            <span className="text-indigo-600">helpful</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            HelpHub brings employees, technicians, and administrators together on
            one platform to submit, triage, and resolve IT issues — fast.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Create an account
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  {f.icon}
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import Link from "next/link";
import { TicketIcon } from "@/components/icons";
import { Footer } from "@/components/Footer";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <TicketIcon className="h-4 w-4" />
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              HelpHub
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {updated && (
          <p className="mt-2 text-sm text-slate-400">Last updated: {updated}</p>
        )}
        <div className="legal-content mt-8 space-y-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        {heading}
      </h2>
      {children}
    </section>
  );
}

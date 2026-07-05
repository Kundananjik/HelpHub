import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();
  return (
    <footer
      className={cn(
        "border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            href="/privacy"
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <Link
            href="/terms"
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Terms &amp; Conditions
          </Link>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <Link
            href="/cookies"
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Cookie Policy
          </Link>
        </nav>
        <p className="font-medium text-slate-700 dark:text-slate-200">
          System created by Kundananji Simukonda
        </p>
        <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a
            href="mailto:Kundananjisimukonda@gmail.com"
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Kundananjisimukonda@gmail.com
          </a>
          <span className="hidden text-slate-300 sm:inline dark:text-slate-600">
            •
          </span>
          <a
            href="tel:+260971863462"
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            +260 971 863 462
          </a>
          <span className="hidden text-slate-300 sm:inline dark:text-slate-600">
            /
          </span>
          <a
            href="tel:+260967591264"
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            +260 967 591 264
          </a>
        </p>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          © {year} HelpHub — IT Service Desk. Built with Next.js, Prisma &
          PostgreSQL.
        </p>
      </div>
    </footer>
  );
}

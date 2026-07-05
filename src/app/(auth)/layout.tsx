import Link from "next/link";
import { TicketIcon } from "@/components/icons";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <TicketIcon />
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                HelpHub
              </span>
            </Link>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              IT Service Desk
            </p>
          </div>
          {children}
        </div>
      </div>
      <Footer className="bg-transparent dark:bg-transparent" />
    </div>
  );
}

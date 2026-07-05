import Link from "next/link";
import { TicketIcon } from "@/components/icons";
import { Footer } from "@/components/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <TicketIcon />
              </span>
              <span className="text-2xl font-bold text-slate-900">HelpHub</span>
            </Link>
            <p className="mt-2 text-sm text-slate-500">IT Service Desk</p>
          </div>
          {children}
        </div>
      </div>
      <Footer className="bg-transparent dark:bg-transparent" />
    </div>
  );
}

"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

const inputBase =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

/**
 * A password field with a show/hide toggle. Accepts all standard input props
 * (except `type`, which it manages).
 */
export function PasswordInput({
  className,
  error,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { error?: boolean }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(inputBase, error && "border-red-400 focus:ring-red-500/30", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        {visible ? (
          <EyeOffIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

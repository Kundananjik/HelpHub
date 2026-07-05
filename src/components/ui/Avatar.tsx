import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white",
        SIZES[size],
        className
      )}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

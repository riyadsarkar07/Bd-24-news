import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted dark:bg-navy-800", className)}
      {...props}
    />
  );
}

export { Skeleton };

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function Loading({ label, className }: { label?: string | undefined; className?: string | undefined }) {
  return (
    <div
      role="status"
      className={cn("flex items-center justify-center gap-3 py-12 text-muted-foreground", className)}
    >
      <Loader2 className="size-5 animate-spin" aria-hidden />
      <span className="text-small">{label ?? "Carregando..."}</span>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string | undefined }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

export function ListSkeleton({ count = 4, className }: { count?: number | undefined; className?: string | undefined }) {
  return (
    <div className={cn("grid grid-cols-2 gap-6 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

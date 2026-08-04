import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon | undefined;
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface px-8 py-16 text-center",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h3 className="text-h4 text-foreground">{title}</h3>
        {description ? (
          <p className="text-small mx-auto max-w-md text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

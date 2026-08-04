import { cn } from "@/lib/utils";

export function Divider({
  orientation = "horizontal",
  className,
  label,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string | undefined;
  label?: string | undefined;
}) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption text-muted-foreground">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return (
    <span
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === "horizontal" ? "block h-px w-full" : "block h-full w-px",
        "bg-border",
        className,
      )}
    />
  );
}

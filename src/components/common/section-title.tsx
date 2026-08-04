import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  align?: "left" | "center";
  action?: ReactNode | undefined;
  className?: string | undefined;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-6",
        align === "center"
          ? "flex-col items-center text-center"
          : "flex-col items-start justify-between md:flex-row md:items-end",
        className,
      )}
    >
      <div className={cn("space-y-2", align === "center" && "max-w-2xl")}>
        {eyebrow ? <p className="text-caption text-accent">{eyebrow}</p> : null}
        <h2 className="text-h2 text-foreground">{title}</h2>
        {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

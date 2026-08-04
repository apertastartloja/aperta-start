import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "top" | "bottom";
  title?: string | undefined;
  description?: string | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
  className?: string | undefined;
}

export function Drawer({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  footer,
  className,
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn("flex w-full flex-col sm:max-w-md", className)}>
        {title ? (
          <SheetHeader>
            <SheetTitle className="text-h4">{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
        ) : null}
        <div className="flex-1 overflow-y-auto px-4">{children}</div>
        {footer ? <SheetFooter>{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}

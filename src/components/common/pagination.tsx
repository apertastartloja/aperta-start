import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string | undefined;
}

const buildPages = (page: number, totalPages: number): number[] => {
  const window = 2;
  const start = Math.max(1, page - window);
  const end = Math.min(totalPages, page + window);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação" className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>

      {buildPages(page, totalPages).map((item) => (
        <Button
          key={item}
          variant={item === page ? "default" : "outline"}
          size="icon"
          aria-current={item === page ? "page" : undefined}
          onClick={() => onPageChange(item)}
        >
          {item}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        aria-label="Próxima página"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

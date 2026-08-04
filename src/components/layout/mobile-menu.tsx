import { Drawer } from "@/components/common/drawer";
import { CategoryMenu } from "./category-menu";
import { Search } from "./search";

export function MobileMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="left" title="Menu">
      <div className="space-y-6 py-2">
        <Search />
        <CategoryMenu onNavigate={() => onOpenChange(false)} />
      </div>
    </Drawer>
  );
}

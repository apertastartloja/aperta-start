import { Icon } from "@/components/common/icon";
import { useInstitutional } from "@/hooks/useContent";

/** Faixa fina de informações comerciais no topo do site. */
export function TopBar() {
  const { data: items = [] } = useInstitutional();

  return (
    <div className="hidden bg-[#000B1F] text-white lg:block">
      <div className="flex h-9 items-center justify-center gap-10">
        {items.map((item) => (
          <span key={item.id} className="flex items-center gap-2 text-[12px] font-medium">
            <Icon name={item.icon} className="size-3.5 text-[#FFC107]" />
            <span className="font-semibold">{item.title}</span>
            <span className="opacity-60">{item.description}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

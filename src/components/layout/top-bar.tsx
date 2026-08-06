import { Icon } from "@/components/common/icon";
import { useInstitutional } from "@/hooks/useContent";

/** Faixa fina de informações comerciais no topo do site. */
export function TopBar() {
  const { data: items = [] } = useInstitutional();

  return (
    <div className="hidden bg-gradient-to-r from-[#000B1F] via-[#081838] to-[#000B1F] text-white border-b border-white/10 lg:block">
      <div className="flex h-10 items-center justify-center gap-10 px-4">
        {items.map((item) => (
          <span key={item.id} className="flex items-center gap-2 text-[12px] font-medium tracking-wide">
            <Icon name={item.icon} className="size-3.5 text-[#FFC107] drop-shadow-[0_0_6px_rgba(255,193,7,0.5)] shrink-0" />
            <span className="font-semibold text-white/95">{item.title}</span>
            <span className="text-white/60">{item.description}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

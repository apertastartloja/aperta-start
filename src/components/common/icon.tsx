import {
  CreditCard,
  Lock,
  Package,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Truck,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IconName } from "@/types";

const MAP: Record<IconName, LucideIcon> = {
  package: Package,
  trophy: Trophy,
  shield: ShieldCheck,
  lock: Lock,
  truck: Truck,
  creditCard: CreditCard,
  pix: Zap,
  refresh: RefreshCw,
};

/** Resolve nomes de ícone vindos da camada de dados (mock hoje, Cloud depois). */
export function Icon({ name, className }: { name: IconName; className?: string | undefined }) {
  const Component = MAP[name];
  return <Component className={className} aria-hidden />;
}

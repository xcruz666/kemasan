import {
  BadgeCheck,
  Beef,
  Box,
  Carrot,
  ChefHat,
  Clock,
  Drumstick,
  Droplets,
  Egg,
  Factory,
  Fish,
  Layers2,
  Leaf,
  type LucideProps,
  Package,
  Recycle,
  Ruler,
  Scale,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Store,
  Thermometer,
  Truck,
  Utensils,
  Wheat,
} from "lucide-react";
import type { ComponentType } from "react";
import type { IconKey } from "@/lib/content/landing-shared";

const icons: Record<IconKey, ComponentType<LucideProps>> = {
  "shield-check": ShieldCheck,
  layers: Layers2,
  ruler: Ruler,
  factory: Factory,
  snowflake: Snowflake,
  package: Package,
  box: Box,
  beef: Beef,
  drumstick: Drumstick,
  fish: Fish,
  carrot: Carrot,
  egg: Egg,
  wheat: Wheat,
  utensils: Utensils,
  "chef-hat": ChefHat,
  leaf: Leaf,
  droplets: Droplets,
  thermometer: Thermometer,
  truck: Truck,
  store: Store,
  scale: Scale,
  clock: Clock,
  sparkles: Sparkles,
  "badge-check": BadgeCheck,
  recycle: Recycle,
};

/** Icon picked in the admin. Unknown keys render nothing. */
export function LandingIcon({ name, ...props }: { name: IconKey } & LucideProps) {
  const Icon = icons[name];
  return Icon ? <Icon {...props} /> : null;
}

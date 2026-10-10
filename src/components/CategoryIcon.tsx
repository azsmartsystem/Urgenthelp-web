import {
  Sparkles,
  Wrench,
  Zap,
  ChefHat,
  Baby,
  Sprout,
  Package,
  BookOpen,
  Scissors,
  Car,
  Laptop,
  PartyPopper,
  PawPrint,
  Hammer,
  Home,
  Truck,
  Shield,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  cleaning: Sparkles,
  plumbing: Wrench,
  electrical: Zap,
  cooking: ChefHat,
  babysitting: Baby,
  'child-care': Baby,
  gardening: Sprout,
  'garden-outdoor': Sprout,
  moving: Package,
  'delivery-logistics': Truck,
  tutoring: BookOpen,
  education: BookOpen,
  beauty: Scissors,
  'beauty-personal-care': Scissors,
  automotive: Car,
  technology: Laptop,
  laptop: Laptop,
  events: PartyPopper,
  pets: PawPrint,
  'home-improvement': Hammer,
  'home-services': Home,
  wrench: Wrench,
  shield: Shield,
};

export function CategoryIcon({
  slug,
  iconKey,
  className,
}: {
  slug: string;
  iconKey?: string | null;
  className?: string;
}) {
  const Icon = ICON_MAP[iconKey ?? ''] ?? ICON_MAP[slug] ?? Sparkles;
  return <Icon className={className} strokeWidth={2} />;
}

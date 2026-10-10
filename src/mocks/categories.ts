import { SERVICE_CATALOG } from '@/data/catalog';
import type { ServiceCategory } from '@/types';

export const CATEGORIES: ServiceCategory[] = SERVICE_CATALOG.map((c) => ({
  id: c.slug,
  slug: c.slug,
  name: c.name,
  iconKey: c.iconKey,
}));

export function servicesForCategory(slug: string): string[] {
  const category = SERVICE_CATALOG.find((c) => c.slug === slug);
  if (!category) return [];
  return category.subcategories.flatMap((sub) => sub.services.map((s) => s.name));
}

export function priceRangeForService(categorySlug: string, serviceName: string): { min: number; max: number } {
  const category = SERVICE_CATALOG.find((c) => c.slug === categorySlug);
  for (const sub of category?.subcategories ?? []) {
    const service = sub.services.find((s) => s.name === serviceName);
    if (service) return { min: service.min, max: service.max };
  }
  return { min: 5000, max: 15000 };
}

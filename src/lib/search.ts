import type { Product } from '~/types';

export function filterProducts(
  products: Product[],
  query: string,
  catFilter: 'all' | 'coffee' | 'pastry' | 'cake' | 'other'
): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    if (catFilter !== 'all' && p.cat !== catFilter) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.thName.includes(query) || p.sku.includes(q);
  });
}

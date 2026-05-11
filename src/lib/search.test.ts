import { filterProducts } from './search';
import type { Product } from '~/types';

const make = (over: Partial<Product>): Product => ({
  id: 'p',
  sku: '8851234500000',
  name: 'Name',
  thName: 'ชื่อ',
  price: 10,
  cat: 'other',
  ...over,
});

const products: Product[] = [
  make({ id: 'P1', sku: '111', name: 'Croissant', thName: 'ครัวซอง', cat: 'pastry' }),
  make({ id: 'P2', sku: '222', name: 'Americano', thName: 'อเมริกาโน่', cat: 'coffee' }),
  make({ id: 'P3', sku: '333', name: 'Latte', thName: 'ลาเต้', cat: 'coffee' }),
  make({ id: 'P4', sku: '4444444', name: 'Butter Cake', thName: 'เค้กเนย', cat: 'cake' }),
];

describe('filterProducts', () => {
  it('returns everything when query is empty and filter is "all"', () => {
    expect(filterProducts(products, '', 'all')).toHaveLength(4);
  });

  it('narrows by category', () => {
    const out = filterProducts(products, '', 'coffee');
    expect(out.map((p) => p.id)).toEqual(['P2', 'P3']);
  });

  it('matches the English name case-insensitively', () => {
    expect(filterProducts(products, 'crois', 'all').map((p) => p.id)).toEqual(['P1']);
    expect(filterProducts(products, 'CROIS', 'all').map((p) => p.id)).toEqual(['P1']);
  });

  it('matches the Thai name using the original query (no lowercasing)', () => {
    expect(filterProducts(products, 'ครัวซอง', 'all').map((p) => p.id)).toEqual(['P1']);
  });

  it('matches the SKU (barcode)', () => {
    expect(filterProducts(products, '4444444', 'all').map((p) => p.id)).toEqual(['P4']);
  });

  it('combines category filter and query', () => {
    expect(filterProducts(products, 'latte', 'coffee').map((p) => p.id)).toEqual(['P3']);
    expect(filterProducts(products, 'latte', 'pastry')).toEqual([]);
  });

  it('returns no matches when nothing fits', () => {
    expect(filterProducts(products, 'xyzzy', 'all')).toEqual([]);
  });

  it('trims surrounding whitespace from the query', () => {
    expect(filterProducts(products, '   latte   ', 'all').map((p) => p.id)).toEqual(['P3']);
  });
});

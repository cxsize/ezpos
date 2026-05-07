import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import type { Product, Coupon } from '~/types';

const KEY_PRODUCTS = '@catalog/products';
const KEY_COUPONS = '@catalog/coupons';

/** Returns the last-known products + coupons from AsyncStorage, or null if none cached. */
export async function loadCachedCatalog(): Promise<{ products: Product[]; coupons: Coupon[] } | null> {
  try {
    const [rawP, rawC] = await Promise.all([
      AsyncStorage.getItem(KEY_PRODUCTS),
      AsyncStorage.getItem(KEY_COUPONS),
    ]);
    if (!rawP || !rawC) return null;
    return { products: JSON.parse(rawP), coupons: JSON.parse(rawC) };
  } catch {
    return null;
  }
}

/**
 * Subscribe to live products. `onMeta(fromCache)` fires whenever Firestore
 * reports whether the snapshot came from local cache (offline) or the server
 * (online) — used to drive the connection indicator in the UI.
 */
export function subscribeProducts(
  cb: (products: Product[]) => void,
  onMeta?: (fromCache: boolean) => void,
): () => void {
  const q = query(collection(db(), 'products'), where('active', '!=', false));
  return onSnapshot(q, { includeMetadataChanges: true }, (snap) => {
    const fromCache = snap.metadata.fromCache;
    onMeta?.(fromCache);

    const items: Product[] = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }));
    items.sort((a, b) => a.name.localeCompare(b.name));

    // Persist a fresh copy so the next cold-start can show products immediately.
    if (!fromCache) {
      AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(items)).catch(() => {});
    }

    cb(items);
  });
}

export function subscribeCoupons(cb: (coupons: Coupon[]) => void): () => void {
  const q = query(collection(db(), 'coupons'), orderBy('code'));
  return onSnapshot(q, (snap) => {
    const items: Coupon[] = [];
    snap.forEach((doc) => {
      const d = doc.data() as Coupon;
      if (d.active === false) return;
      items.push(d);
    });

    if (!snap.metadata.fromCache) {
      AsyncStorage.setItem(KEY_COUPONS, JSON.stringify(items)).catch(() => {});
    }

    cb(items);
  });
}

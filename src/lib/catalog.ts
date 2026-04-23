import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, Coupon } from '~/types';

export function subscribeProducts(cb: (products: Product[]) => void): () => void {
  const q = query(collection(db(), 'products'), where('active', '!=', false));
  return onSnapshot(q, (snap) => {
    const items: Product[] = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }));
    items.sort((a, b) => a.name.localeCompare(b.name));
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
    cb(items);
  });
}

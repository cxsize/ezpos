import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import type { Sale, VoidInfo } from '~/types';

const QUEUE_KEY = '@sales/pending';
const SALES_LIMIT = 250;

async function readQueue(): Promise<Sale[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: Sale[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue)).catch(() => {});
}

/** Save a sale to Firestore. If offline, queues it in AsyncStorage for later. */
export async function saveSale(sale: Sale): Promise<void> {
  try {
    await setDoc(doc(collection(db(), 'sales'), sale.id), sale);
  } catch {
    const queue = await readQueue();
    if (!queue.some((s) => s.id === sale.id)) queue.push(sale);
    await writeQueue(queue);
  }
}

/**
 * Retry all queued sales that failed while offline.
 * Called automatically when Firestore reports a live server snapshot.
 * Returns the number of sales successfully flushed.
 */
export async function flushSaleQueue(): Promise<number> {
  const queue = await readQueue();
  if (queue.length === 0) return 0;

  const remaining: Sale[] = [];
  let flushed = 0;
  for (const sale of queue) {
    try {
      await setDoc(doc(collection(db(), 'sales'), sale.id), sale);
      flushed++;
    } catch {
      remaining.push(sale);
    }
  }
  await writeQueue(remaining);
  return flushed;
}

/** Subscribe to the most recent sales (last 250, newest first). */
export function subscribeRecentSales(cb: (sales: Sale[]) => void): () => void {
  const q = query(collection(db(), 'sales'), orderBy('createdAt', 'desc'), limit(SALES_LIMIT));
  return onSnapshot(q, (snap) => {
    const items: Sale[] = [];
    snap.forEach((d) => items.push(d.data() as Sale));
    cb(items);
  });
}

export async function getSale(id: string): Promise<Sale | null> {
  const snap = await getDoc(doc(db(), 'sales', id));
  return snap.exists() ? (snap.data() as Sale) : null;
}

/**
 * Mark a sale as voided. Firestore rules permit only fields outside the
 * financial set to change, so we only write the `voided` map.
 */
export async function voidSale(
  saleId: string,
  voidedBy: string,
  voidedByName: string,
  reason?: string,
): Promise<void> {
  const voided: VoidInfo = {
    voidedAt: Date.now(),
    voidedBy,
    voidedByName,
    ...(reason ? { reason } : {}),
  };
  await updateDoc(doc(db(), 'sales', saleId), { voided });
}

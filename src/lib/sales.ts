import { collection, doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import type { Sale } from '~/types';

const QUEUE_KEY = '@sales/pending';

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

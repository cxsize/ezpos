import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Sale } from '~/types';

export async function saveSale(sale: Sale): Promise<void> {
  await setDoc(doc(collection(db(), 'sales'), sale.id), sale);
}

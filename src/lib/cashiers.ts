import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { hashPin, verifyPin } from './pin';
import type { Cashier } from '~/types';

export const DEV_CASHIER_ID = 'dev-cashier';
export const DEV_CASHIER_PIN = '0000';

export async function listCashiers(): Promise<Cashier[]> {
  const snap = await getDocs(collection(db(), 'cashiers'));
  const items: Cashier[] = [];
  snap.forEach((d) => {
    const data = d.data() as Omit<Cashier, 'id'>;
    if (data.active === false) return;
    items.push({ id: d.id, ...data });
  });
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

export async function hasAnyCashier(): Promise<boolean> {
  const snap = await getDocs(query(collection(db(), 'cashiers'), where('active', '!=', false)));
  return !snap.empty;
}

export async function createCashier(name: string, pin: string): Promise<Cashier> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Name is required');
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be 4 digits');
  const id = trimmed.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 6);
  const pinHash = await hashPin(pin);
  const cashier: Cashier = { id, name: trimmed, pinHash, active: true, createdAt: Date.now() };
  await setDoc(doc(db(), 'cashiers', id), cashier);
  return cashier;
}

/**
 * In mock-hardware mode, make sure a well-known cashier exists so the PIN
 * screen can be blown past during dev. PIN is DEV_CASHIER_PIN ("0000").
 */
export async function ensureDevCashier(): Promise<Cashier> {
  const ref = doc(db(), 'cashiers', DEV_CASHIER_ID);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...(snap.data() as Omit<Cashier, 'id'>) };
  const pinHash = await hashPin(DEV_CASHIER_PIN);
  const cashier: Cashier = {
    id: DEV_CASHIER_ID,
    name: 'Dev Cashier',
    pinHash,
    active: true,
    createdAt: Date.now(),
  };
  await setDoc(ref, cashier);
  return cashier;
}

export async function authenticate(id: string, pin: string): Promise<Cashier | null> {
  const snap = await getDoc(doc(db(), 'cashiers', id));
  if (!snap.exists()) return null;
  const cashier = { id: snap.id, ...(snap.data() as Omit<Cashier, 'id'>) };
  if (cashier.active === false) return null;
  const ok = await verifyPin(pin, cashier.pinHash);
  return ok ? cashier : null;
}

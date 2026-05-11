import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { hashPin, verifyPin } from './pin';
import type { Cashier, CashierRole } from '~/types';

export const DEV_CASHIER_ID = 'dev-cashier';
export const DEV_CASHIER_PIN = '0000';

function normalize(raw: { id: string } & Record<string, unknown>): Cashier {
  // Older docs may not have `role` — treat them as cashier.
  return {
    id: raw.id,
    name: String(raw.name ?? ''),
    pinHash: String(raw.pinHash ?? ''),
    role: (raw.role as CashierRole) ?? 'cashier',
    active: raw.active !== false,
    createdAt: Number(raw.createdAt ?? Date.now()),
  };
}

export async function listCashiers(): Promise<Cashier[]> {
  const snap = await getDocs(collection(db(), 'cashiers'));
  const items: Cashier[] = [];
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    if (data.active === false) return;
    items.push(normalize({ id: d.id, ...data }));
  });
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

export async function hasAnyCashier(): Promise<boolean> {
  const snap = await getDocs(query(collection(db(), 'cashiers'), where('active', '!=', false)));
  return !snap.empty;
}

export async function createCashier(
  name: string,
  pin: string,
  role: CashierRole = 'cashier',
): Promise<Cashier> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Name is required');
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be 4 digits');
  const id = trimmed.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 6);
  const pinHash = await hashPin(pin);
  const cashier: Cashier = { id, name: trimmed, pinHash, role, active: true, createdAt: Date.now() };
  await setDoc(doc(db(), 'cashiers', id), cashier);
  return cashier;
}

/** First-time setup: if no cashier exists yet, the new one is automatically the owner. */
export async function enrollFirstOwner(name: string, pin: string): Promise<Cashier> {
  if (await hasAnyCashier()) throw new Error('Setup already complete');
  return createCashier(name, pin, 'owner');
}

export async function updateCashierPin(id: string, newPin: string): Promise<void> {
  if (!/^\d{4}$/.test(newPin)) throw new Error('PIN must be 4 digits');
  const pinHash = await hashPin(newPin);
  await updateDoc(doc(db(), 'cashiers', id), { pinHash });
}

export async function deactivateCashier(id: string): Promise<void> {
  await updateDoc(doc(db(), 'cashiers', id), { active: false });
}

/**
 * In mock-hardware mode, make sure a well-known owner-cashier exists so the
 * PIN screen can be blown past during dev. PIN is DEV_CASHIER_PIN ("0000").
 */
export async function ensureDevCashier(): Promise<Cashier> {
  const ref = doc(db(), 'cashiers', DEV_CASHIER_ID);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const existing = normalize({ id: snap.id, ...(snap.data() as Record<string, unknown>) });
    // Backfill role if the dev cashier was created before roles existed.
    if (existing.role !== 'owner') {
      await updateDoc(ref, { role: 'owner' });
      existing.role = 'owner';
    }
    return existing;
  }
  const pinHash = await hashPin(DEV_CASHIER_PIN);
  const cashier: Cashier = {
    id: DEV_CASHIER_ID,
    name: 'Dev Cashier',
    pinHash,
    role: 'owner',
    active: true,
    createdAt: Date.now(),
  };
  await setDoc(ref, cashier);
  return cashier;
}

export async function authenticate(id: string, pin: string): Promise<Cashier | null> {
  const snap = await getDoc(doc(db(), 'cashiers', id));
  if (!snap.exists()) return null;
  const cashier = normalize({ id: snap.id, ...(snap.data() as Record<string, unknown>) });
  if (!cashier.active) return null;
  const ok = await verifyPin(pin, cashier.pinHash);
  return ok ? cashier : null;
}

export function isOwner(c: Cashier | null | undefined): boolean {
  return !!c && c.role === 'owner' && c.active !== false;
}

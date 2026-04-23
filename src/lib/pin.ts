// Non-reversible PIN hashing. 4-digit PINs are weak; a per-cashier salt + many SHA-256
// rounds raise the cost of brute-forcing a leaked Firestore doc.
import * as Crypto from 'expo-crypto';

const ROUNDS = 20_000;

function randomSalt(): string {
  const bytes = Crypto.getRandomBytes(16);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function rounds(salt: string, pin: string): Promise<string> {
  let acc = `${salt}:${pin}`;
  for (let i = 0; i < ROUNDS; i++) {
    acc = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, acc);
  }
  return acc;
}

export async function hashPin(pin: string): Promise<string> {
  const salt = randomSalt();
  const hash = await rounds(salt, pin);
  return `v1$${salt}$${hash}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [ver, salt, want] = stored.split('$');
  if (ver !== 'v1' || !salt || !want) return false;
  const got = await rounds(salt, pin);
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

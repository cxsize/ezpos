// Test mock for expo-crypto. Uses Node's `crypto` so PIN hashing matches
// the production algorithm (SHA-256), keeping tests deterministic without
// linking to the Expo native module.
import { createHash, randomBytes } from 'crypto';

export const CryptoDigestAlgorithm = {
  SHA256: 'SHA-256',
} as const;

export function getRandomBytes(n: number): Uint8Array {
  return Uint8Array.from(randomBytes(n));
}

export async function digestStringAsync(_alg: string, input: string): Promise<string> {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

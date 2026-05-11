// Simple in-memory AsyncStorage mock — enough for zustand persist + the
// catalog / sales offline queue.
const store = new Map<string, string>();

const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    return store.has(key) ? (store.get(key) as string) : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    store.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    store.delete(key);
  },
  async clear(): Promise<void> {
    store.clear();
  },
  async getAllKeys(): Promise<string[]> {
    return [...store.keys()];
  },
  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    return keys.map((k) => [k, store.has(k) ? (store.get(k) as string) : null]);
  },
  async multiSet(pairs: Array<[string, string]>): Promise<void> {
    for (const [k, v] of pairs) store.set(k, v);
  },
  async multiRemove(keys: string[]): Promise<void> {
    for (const k of keys) store.delete(k);
  },
};

export default AsyncStorage;

/** Test-only: wipe the underlying store between tests. */
export function __resetAsyncStorage(): void {
  store.clear();
}

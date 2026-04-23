// Tiny event bus wiring the mock hardware to the DevPanel UI. Only used in
// mock mode; a no-op in production since nothing subscribes.

import type { Sale } from '~/types';

type Events = {
  'receipt:printed': { sale: Sale; lines: string[] };
  'drawer:kick': void;
};

type Handler<K extends keyof Events> = (payload: Events[K]) => void;

const subs = new Map<keyof Events, Set<Handler<keyof Events>>>();

export const devBus = {
  on<K extends keyof Events>(event: K, handler: Handler<K>): () => void {
    let set = subs.get(event);
    if (!set) {
      set = new Set();
      subs.set(event, set);
    }
    set.add(handler as Handler<keyof Events>);
    return () => set!.delete(handler as Handler<keyof Events>);
  },
  emit<K extends keyof Events>(event: K, payload?: Events[K]) {
    const set = subs.get(event);
    if (!set) return;
    for (const h of set) (h as Handler<K>)(payload as Events[K]);
  },
};

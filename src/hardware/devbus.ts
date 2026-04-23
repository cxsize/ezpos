// Tiny event bus wiring the mock hardware to the DevPanel UI. Only used in
// mock mode; a no-op in production since nothing subscribes.

import type { Sale } from '~/types';

type Events = {
  'receipt:printed': { sale: Sale; lines: string[] };
  'drawer:kick': void;
};

type Handler<K extends keyof Events> = (payload: Events[K]) => void;

const subs: { [K in keyof Events]?: Set<Handler<K>> } = {};

export const devBus = {
  on<K extends keyof Events>(event: K, handler: Handler<K>): () => void {
    const set = (subs[event] ??= new Set()) as Set<Handler<K>>;
    set.add(handler);
    return () => set.delete(handler);
  },
  emit<K extends keyof Events>(event: K, payload?: Events[K]) {
    const set = subs[event] as Set<Handler<K>> | undefined;
    if (!set) return;
    for (const h of set) h(payload as Events[K]);
  },
};

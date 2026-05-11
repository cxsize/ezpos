import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ParkedSale, CartLine, Discount } from '~/types';

type ParkInput = {
  cart: CartLine[];
  discount: Discount;
  cashierName: string;
  note?: string;
};

type State = {
  list: ParkedSale[];
  park: (input: ParkInput) => ParkedSale;
  resume: (id: string) => ParkedSale | undefined;
  remove: (id: string) => void;
};

const MAX_PARKED = 20;

export const useParked = create<State>()(
  persist(
    (set, get) => ({
      list: [],
      park: ({ cart, discount, cashierName, note }) => {
        const ps: ParkedSale = {
          id: 'park-' + Math.random().toString(36).slice(2, 10),
          cart,
          discount,
          cashierName,
          note,
          createdAt: Date.now(),
        };
        set({ list: [ps, ...get().list].slice(0, MAX_PARKED) });
        return ps;
      },
      resume: (id) => {
        const found = get().list.find((p) => p.id === id);
        if (!found) return undefined;
        set({ list: get().list.filter((p) => p.id !== id) });
        return found;
      },
      remove: (id) => set({ list: get().list.filter((p) => p.id !== id) }),
    }),
    {
      name: '@parked-sales',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

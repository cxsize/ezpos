import { create } from 'zustand';
import type { Cashier } from '~/types';

type SessionState = {
  cashier: Cashier | null;
  signIn: (c: Cashier) => void;
  signOut: () => void;
};

export const useSession = create<SessionState>((set) => ({
  cashier: null,
  signIn: (c) => set({ cashier: c }),
  signOut: () => set({ cashier: null }),
}));

import { create } from 'zustand';
import { useParked } from './parked';
import type { CartLine, Discount, ParkedSale, PayMethod, PayStep, Product } from '~/types';

type SaleState = {
  // cart
  cart: CartLine[];
  flash: string | null;
  // browse
  query: string;
  catFilter: 'all' | 'coffee' | 'pastry' | 'cake' | 'other';
  // discount
  discount: Discount;
  discOpen: boolean;
  // pay flow
  view: 'sale' | 'pay';
  payStep: PayStep;
  payMethod: PayMethod | null;
  cashTendered: string;

  // actions
  addItem: (p: Product) => void;
  incItem: (id: string) => void;
  decItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setQuery: (q: string) => void;
  setCat: (c: SaleState['catFilter']) => void;
  setDiscount: (d: Discount) => void;
  setDiscOpen: (o: boolean) => void;
  goPay: () => void;
  backToSale: () => void;
  pickMethod: (m: PayMethod) => void;
  setCashTendered: (s: string) => void;
  confirmCash: () => void;
  completeSale: (m: PayMethod) => void;
  newSale: () => void;
  parkAndClear: (cashierName: string, note?: string) => ParkedSale | null;
  resumeFrom: (parked: ParkedSale) => void;
};

export const useSale = create<SaleState>((set, get) => ({
  cart: [],
  flash: null,
  query: '',
  catFilter: 'all',
  discount: { type: 'none', value: 0 },
  discOpen: false,
  view: 'sale',
  payStep: 'method',
  payMethod: null,
  cashTendered: '',

  addItem: (p) => {
    set((s) => {
      const i = s.cart.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const next = [...s.cart];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return { cart: next, flash: p.id };
      }
      return { cart: [...s.cart, { ...p, qty: 1 }], flash: p.id };
    });
    setTimeout(() => {
      if (get().flash === p.id) set({ flash: null });
    }, 500);
  },
  incItem: (id) =>
    set((s) => ({ cart: s.cart.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)) })),
  decItem: (id) =>
    set((s) => {
      const item = s.cart.find((x) => x.id === id);
      if (item && item.qty === 1) return { cart: s.cart.filter((x) => x.id !== id) };
      return { cart: s.cart.map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x)) };
    }),
  removeItem: (id) => set((s) => ({ cart: s.cart.filter((x) => x.id !== id) })),
  clearCart: () => set({ cart: [], discount: { type: 'none', value: 0 } }),
  setQuery: (query) => set({ query }),
  setCat: (catFilter) => set({ catFilter }),
  setDiscount: (discount) => set({ discount }),
  setDiscOpen: (discOpen) => set({ discOpen }),
  goPay: () => set({ view: 'pay', payStep: 'method' }),
  backToSale: () => set({ view: 'sale', payStep: 'method' }),
  pickMethod: (m) =>
    set(() =>
      m === 'cash'
        ? { payMethod: m, cashTendered: '', payStep: 'cash' }
        : { payMethod: m, payStep: 'qr' }
    ),
  setCashTendered: (cashTendered) => set({ cashTendered }),
  confirmCash: () => set({ payStep: 'drawer' }),
  completeSale: (m) => set({ payMethod: m, payStep: 'done' }),
  newSale: () =>
    set({
      cart: [],
      query: '',
      catFilter: 'all',
      discount: { type: 'none', value: 0 },
      cashTendered: '',
      payMethod: null,
      payStep: 'method',
      view: 'sale',
    }),
  parkAndClear: (cashierName, note) => {
    const { cart, discount } = get();
    if (cart.length === 0) return null;
    const parked = useParked.getState().park({ cart, discount, cashierName, note });
    set({
      cart: [],
      query: '',
      discount: { type: 'none', value: 0 },
      flash: null,
    });
    return parked;
  },
  resumeFrom: (parked) => {
    set({
      cart: parked.cart,
      discount: parked.discount,
      query: '',
      catFilter: 'all',
      view: 'sale',
      payStep: 'method',
      payMethod: null,
      cashTendered: '',
    });
  },
}));

// Derived helpers (not selectors; call directly from components with useSale(...))
export function totals(cart: CartLine[], discount: Discount) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt =
    discount.type === 'pct'
      ? Math.round((subtotal * discount.value) / 100)
      : discount.type === 'amt'
      ? discount.value
      : 0;
  const total = Math.max(0, subtotal - discountAmt);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return { subtotal, discountAmt, total, count };
}

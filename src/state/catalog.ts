import { create } from 'zustand';
import type { Coupon, Product } from '~/types';

type CatalogState = {
  products: Product[];
  coupons: Coupon[];
  loaded: boolean;
  setProducts: (products: Product[]) => void;
  setCoupons: (coupons: Coupon[]) => void;
  setLoaded: (loaded: boolean) => void;
};

export const useCatalog = create<CatalogState>((set) => ({
  products: [],
  coupons: [],
  loaded: false,
  setProducts: (products) => set({ products }),
  setCoupons: (coupons) => set({ coupons }),
  setLoaded: (loaded) => set({ loaded }),
}));

export const QUICK_PICK_CODES = ['P007', 'P008', 'P001', 'P003', 'P010', 'P009', 'P002', 'P006'];

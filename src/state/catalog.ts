import { create } from 'zustand';
import type { Coupon, Product } from '~/types';

type CatalogState = {
  products: Product[];
  coupons: Coupon[];
  loaded: boolean;
  online: boolean;
  setProducts: (products: Product[]) => void;
  setCoupons: (coupons: Coupon[]) => void;
  setLoaded: (loaded: boolean) => void;
  setOnline: (online: boolean) => void;
};

export const useCatalog = create<CatalogState>((set) => ({
  products: [],
  coupons: [],
  loaded: false,
  online: true,
  setProducts: (products) => set({ products }),
  setCoupons: (coupons) => set({ coupons }),
  setLoaded: (loaded) => set({ loaded }),
  setOnline: (online) => set({ online }),
}));

export const QUICK_PICK_CODES = ['P007', 'P008', 'P001', 'P003', 'P010', 'P009', 'P002', 'P006'];

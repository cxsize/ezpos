export type Category = 'coffee' | 'pastry' | 'cake' | 'other';

export type Product = {
  id: string;
  sku: string;
  name: string;
  thName: string;
  price: number;
  cat: Category;
  emoji?: string;
  active?: boolean;
};

export type CartLine = Product & { qty: number };

export type Discount =
  | { type: 'none'; value: 0 }
  | { type: 'pct'; value: number; code?: string; name?: string }
  | { type: 'amt'; value: number; code?: string; name?: string };

export type CouponType = 'pct' | 'amt';

export type Coupon = {
  code: string;
  barcode: string;
  name: string;
  thName: string;
  type: CouponType;
  value: number;
  tag?: string;
  active?: boolean;
};

export type PayMethod = 'cash' | 'qr';
export type PayStep = 'method' | 'cash' | 'qr' | 'drawer' | 'done';

export type Cashier = {
  id: string;
  name: string;
  pinHash: string;
  active: boolean;
  createdAt: number;
};

export type Sale = {
  id: string;
  receiptNo: string;
  cashierId: string;
  cashierName: string;
  registerId: string;
  items: Array<{ productId: string; name: string; thName: string; qty: number; price: number }>;
  subtotal: number;
  discount: Discount;
  discountAmt: number;
  total: number;
  method: PayMethod;
  cashTendered?: number;
  change?: number;
  createdAt: number;
};

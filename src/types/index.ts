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

export type CashierRole = 'owner' | 'cashier';

export type Cashier = {
  id: string;
  name: string;
  pinHash: string;
  role: CashierRole;
  active: boolean;
  createdAt: number;
};

export type VoidInfo = {
  voidedAt: number;
  voidedBy: string;
  voidedByName: string;
  reason?: string;
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
  voided?: VoidInfo;
};

/** A cart kept aside ("parked") so the cashier can serve the next customer first. */
export type ParkedSale = {
  id: string;
  cart: CartLine[];
  discount: Discount;
  createdAt: number;
  cashierName: string;
  note?: string;
};

import type { CartLine, Discount, Product } from '~/types';
import { __resetAsyncStorage } from '../../test/mocks/async-storage';

// Reload module so the zustand store starts clean per test.
function freshSale() {
  jest.resetModules();
  __resetAsyncStorage();
  return {
    useSale: require('./sale').useSale as typeof import('./sale').useSale,
    totals: require('./sale').totals as typeof import('./sale').totals,
    useParked: require('./parked').useParked as typeof import('./parked').useParked,
  };
}

const product = (id: string, price = 50): Product => ({
  id,
  sku: id,
  name: id,
  thName: id,
  price,
  cat: 'other',
});

describe('totals()', () => {
  const cart = (lines: Array<[string, number, number]>): CartLine[] =>
    lines.map(([id, price, qty]) => ({ ...product(id, price), qty }));

  it('returns zeros for an empty cart', () => {
    const { totals } = freshSale();
    expect(totals([], { type: 'none', value: 0 })).toEqual({
      subtotal: 0,
      discountAmt: 0,
      total: 0,
      count: 0,
    });
  });

  it('sums qty × price across all lines', () => {
    const { totals } = freshSale();
    const out = totals(cart([['A', 50, 2], ['B', 30, 1]]), { type: 'none', value: 0 });
    expect(out.subtotal).toBe(130);
    expect(out.count).toBe(3);
    expect(out.discountAmt).toBe(0);
    expect(out.total).toBe(130);
  });

  it('rounds a percent discount to the nearest baht', () => {
    const { totals } = freshSale();
    const out = totals(cart([['A', 99, 1]]), { type: 'pct', value: 10 });
    // 99 * 10/100 = 9.9 → rounded to 10
    expect(out.discountAmt).toBe(10);
    expect(out.total).toBe(89);
  });

  it('applies a fixed-baht discount as-is', () => {
    const { totals } = freshSale();
    const out = totals(cart([['A', 100, 1]]), { type: 'amt', value: 30 });
    expect(out.discountAmt).toBe(30);
    expect(out.total).toBe(70);
  });

  it('clamps total to 0 when the discount exceeds the subtotal', () => {
    const { totals } = freshSale();
    const out = totals(cart([['A', 50, 1]]), { type: 'amt', value: 999 });
    expect(out.total).toBe(0);
  });
});

describe('useSale cart actions', () => {
  it('addItem appends a new line; second add increments qty', () => {
    const { useSale } = freshSale();
    useSale.getState().addItem(product('A'));
    expect(useSale.getState().cart).toEqual([expect.objectContaining({ id: 'A', qty: 1 })]);
    useSale.getState().addItem(product('A'));
    expect(useSale.getState().cart[0].qty).toBe(2);
    useSale.getState().addItem(product('B'));
    expect(useSale.getState().cart).toHaveLength(2);
  });

  it('incItem bumps qty for an existing line only', () => {
    const { useSale } = freshSale();
    useSale.getState().addItem(product('A'));
    useSale.getState().incItem('A');
    expect(useSale.getState().cart[0].qty).toBe(2);
    useSale.getState().incItem('nonexistent');
    expect(useSale.getState().cart).toHaveLength(1);
  });

  it('decItem decreases qty, removing the line when it would hit zero', () => {
    const { useSale } = freshSale();
    useSale.getState().addItem(product('A'));
    useSale.getState().incItem('A');
    useSale.getState().decItem('A');
    expect(useSale.getState().cart[0].qty).toBe(1);
    useSale.getState().decItem('A');
    expect(useSale.getState().cart).toHaveLength(0);
    // Decrementing an unknown id is a no-op
    useSale.getState().decItem('ghost');
    expect(useSale.getState().cart).toHaveLength(0);
  });

  it('removeItem strips the line outright', () => {
    const { useSale } = freshSale();
    useSale.getState().addItem(product('A'));
    useSale.getState().addItem(product('B'));
    useSale.getState().removeItem('A');
    expect(useSale.getState().cart.map((c) => c.id)).toEqual(['B']);
  });

  it('clearCart resets cart and discount', () => {
    const { useSale } = freshSale();
    useSale.getState().addItem(product('A'));
    useSale.getState().setDiscount({ type: 'pct', value: 10 });
    useSale.getState().clearCart();
    expect(useSale.getState().cart).toEqual([]);
    expect(useSale.getState().discount).toEqual({ type: 'none', value: 0 });
  });

  it('setQuery / setCat update browse state', () => {
    const { useSale } = freshSale();
    useSale.getState().setQuery('lat');
    useSale.getState().setCat('coffee');
    expect(useSale.getState().query).toBe('lat');
    expect(useSale.getState().catFilter).toBe('coffee');
  });

  it('setDiscount + setDiscOpen update discount UI state', () => {
    const { useSale } = freshSale();
    const d: Discount = { type: 'amt', value: 50, code: 'X' };
    useSale.getState().setDiscount(d);
    expect(useSale.getState().discount).toEqual(d);
    useSale.getState().setDiscOpen(true);
    expect(useSale.getState().discOpen).toBe(true);
  });
});

describe('useSale pay flow', () => {
  it('goPay / backToSale toggle the screen', () => {
    const { useSale } = freshSale();
    useSale.getState().goPay();
    expect(useSale.getState().view).toBe('pay');
    expect(useSale.getState().payStep).toBe('method');
    useSale.getState().backToSale();
    expect(useSale.getState().view).toBe('sale');
  });

  it('pickMethod(cash) moves to the cash keypad and clears the tendered field', () => {
    const { useSale } = freshSale();
    useSale.getState().setCashTendered('999');
    useSale.getState().pickMethod('cash');
    expect(useSale.getState().payMethod).toBe('cash');
    expect(useSale.getState().payStep).toBe('cash');
    expect(useSale.getState().cashTendered).toBe('');
  });

  it('pickMethod(qr) moves to the QR step', () => {
    const { useSale } = freshSale();
    useSale.getState().pickMethod('qr');
    expect(useSale.getState().payMethod).toBe('qr');
    expect(useSale.getState().payStep).toBe('qr');
  });

  it('confirmCash → drawer; completeSale → done', () => {
    const { useSale } = freshSale();
    useSale.getState().confirmCash();
    expect(useSale.getState().payStep).toBe('drawer');
    useSale.getState().completeSale('cash');
    expect(useSale.getState().payStep).toBe('done');
    expect(useSale.getState().payMethod).toBe('cash');
  });

  it('newSale resets cart, discount, query, and pay state', () => {
    const { useSale } = freshSale();
    useSale.getState().addItem(product('A'));
    useSale.getState().setDiscount({ type: 'pct', value: 5 });
    useSale.getState().setQuery('x');
    useSale.getState().setCat('coffee');
    useSale.getState().goPay();
    useSale.getState().newSale();
    expect(useSale.getState()).toMatchObject({
      cart: [],
      query: '',
      catFilter: 'all',
      discount: { type: 'none', value: 0 },
      view: 'sale',
      payStep: 'method',
      payMethod: null,
    });
  });
});

describe('useSale park / resume bridge', () => {
  it('parkAndClear stashes the cart into useParked and clears local state', () => {
    const { useSale, useParked } = freshSale();
    useSale.getState().addItem(product('A'));
    useSale.getState().setDiscount({ type: 'pct', value: 5 });
    const parked = useSale.getState().parkAndClear('Ploy', 'wait 5min');
    expect(parked?.cashierName).toBe('Ploy');
    expect(parked?.note).toBe('wait 5min');
    expect(useSale.getState().cart).toEqual([]);
    expect(useSale.getState().discount).toEqual({ type: 'none', value: 0 });
    expect(useParked.getState().list[0].cart[0].id).toBe('A');
  });

  it('parkAndClear does nothing when the cart is empty', () => {
    const { useSale, useParked } = freshSale();
    expect(useSale.getState().parkAndClear('X')).toBeNull();
    expect(useParked.getState().list).toEqual([]);
  });

  it('resumeFrom replaces the current cart and resets the pay flow', () => {
    const { useSale } = freshSale();
    useSale.getState().goPay(); // some prior state we expect to be cleared
    useSale.getState().resumeFrom({
      id: 'park-1',
      cart: [{ ...product('Z'), qty: 3 }],
      discount: { type: 'pct', value: 10 },
      cashierName: 'X',
      createdAt: 1,
    });
    expect(useSale.getState().cart).toEqual([expect.objectContaining({ id: 'Z', qty: 3 })]);
    expect(useSale.getState().discount).toEqual({ type: 'pct', value: 10 });
    expect(useSale.getState().view).toBe('sale');
  });
});

describe('addItem flash flag', () => {
  it('clears the flash marker on the trailing timer', () => {
    jest.useFakeTimers();
    const { useSale } = freshSale();
    useSale.getState().addItem(product('A'));
    expect(useSale.getState().flash).toBe('A');
    jest.advanceTimersByTime(600);
    expect(useSale.getState().flash).toBeNull();
    jest.useRealTimers();
  });
});

import type { CartLine, Discount } from '~/types';
import { __resetAsyncStorage } from '../../test/mocks/async-storage';

// Reset the persisted store between tests by reloading the module after
// clearing AsyncStorage. zustand's persist middleware reads on import.
function freshStore() {
  jest.resetModules();
  __resetAsyncStorage();
  return require('./parked').useParked as typeof import('./parked').useParked;
}

const line = (id: string, qty = 1): CartLine => ({
  id,
  sku: id,
  name: id,
  thName: id,
  price: 10,
  cat: 'other',
  qty,
});

const noDisc: Discount = { type: 'none', value: 0 };

describe('useParked', () => {
  beforeEach(() => {
    __resetAsyncStorage();
  });

  it('park() prepends a new entry with id, createdAt, and matching fields', () => {
    const useParked = freshStore();
    const ps = useParked.getState().park({
      cart: [line('A')],
      discount: noDisc,
      cashierName: 'Ploy',
      note: 'first',
    });
    expect(ps.id).toMatch(/^park-/);
    expect(ps.createdAt).toBeGreaterThan(0);
    expect(ps.cashierName).toBe('Ploy');
    expect(ps.cart).toEqual([line('A')]);
    expect(ps.note).toBe('first');
    expect(useParked.getState().list).toHaveLength(1);
  });

  it('park() puts the newest entry first', () => {
    const useParked = freshStore();
    useParked.getState().park({ cart: [line('A')], discount: noDisc, cashierName: 'X' });
    useParked.getState().park({ cart: [line('B')], discount: noDisc, cashierName: 'X' });
    expect(useParked.getState().list[0].cart[0].id).toBe('B');
  });

  it('park() caps the list at 20 entries (oldest drops off)', () => {
    const useParked = freshStore();
    for (let i = 0; i < 25; i++) {
      useParked.getState().park({
        cart: [line(`P${i}`)],
        discount: noDisc,
        cashierName: 'X',
      });
    }
    const list = useParked.getState().list;
    expect(list).toHaveLength(20);
    expect(list[0].cart[0].id).toBe('P24');
    expect(list[list.length - 1].cart[0].id).toBe('P5');
  });

  it('resume() returns the matching entry and removes it from the list', () => {
    const useParked = freshStore();
    const ps = useParked.getState().park({
      cart: [line('A')],
      discount: noDisc,
      cashierName: 'X',
    });
    const got = useParked.getState().resume(ps.id);
    expect(got?.id).toBe(ps.id);
    expect(useParked.getState().list).toHaveLength(0);
  });

  it('resume() with an unknown id returns undefined and leaves the list alone', () => {
    const useParked = freshStore();
    useParked.getState().park({ cart: [line('A')], discount: noDisc, cashierName: 'X' });
    expect(useParked.getState().resume('does-not-exist')).toBeUndefined();
    expect(useParked.getState().list).toHaveLength(1);
  });

  it('remove() drops the entry without resuming', () => {
    const useParked = freshStore();
    const a = useParked.getState().park({ cart: [line('A')], discount: noDisc, cashierName: 'X' });
    const b = useParked.getState().park({ cart: [line('B')], discount: noDisc, cashierName: 'X' });
    useParked.getState().remove(a.id);
    expect(useParked.getState().list.map((p) => p.id)).toEqual([b.id]);
  });
});

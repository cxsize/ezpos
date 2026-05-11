import { devBus } from './devbus';
import type { Sale } from '~/types';

const sampleSale: Sale = {
  id: 's1',
  receiptNo: 'R-0001',
  cashierId: 'c1',
  cashierName: 'Test',
  registerId: '01',
  items: [],
  subtotal: 100,
  discount: { type: 'none', value: 0 },
  discountAmt: 0,
  total: 100,
  method: 'cash',
  createdAt: 0,
};

describe('devBus', () => {
  it('invokes a subscribed handler when its event is emitted', () => {
    const handler = jest.fn();
    devBus.on('drawer:kick', handler);
    devBus.emit('drawer:kick');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('passes the payload through for typed events', () => {
    const handler = jest.fn();
    devBus.on('receipt:printed', handler);
    devBus.emit('receipt:printed', { sale: sampleSale, lines: ['a', 'b'] });
    expect(handler).toHaveBeenCalledWith({ sale: sampleSale, lines: ['a', 'b'] });
  });

  it('returns an unsubscribe function that detaches the handler', () => {
    const handler = jest.fn();
    const off = devBus.on('drawer:kick', handler);
    off();
    devBus.emit('drawer:kick');
    expect(handler).not.toHaveBeenCalled();
  });

  it('emits with no subscribers as a no-op', () => {
    expect(() => devBus.emit('drawer:kick')).not.toThrow();
  });

  it('emits before anyone has ever subscribed to the event', () => {
    // The bus is a module-level singleton, so re-import to get a clean
    // subscription map and verify the `set === undefined` early-return path.
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fresh: typeof devBus = require('./devbus').devBus;
    expect(() => fresh.emit('drawer:kick')).not.toThrow();
  });

  it('keeps unrelated event handlers independent', () => {
    const a = jest.fn();
    const b = jest.fn();
    devBus.on('drawer:kick', a);
    devBus.on('receipt:printed', b);
    devBus.emit('drawer:kick');
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
  });
});

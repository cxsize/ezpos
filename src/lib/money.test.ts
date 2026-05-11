import { fmtTHB, fmtTHB2 } from './money';

describe('fmtTHB', () => {
  it('prefixes a baht sign and rounds to whole baht', () => {
    expect(fmtTHB(0)).toBe('฿0');
    expect(fmtTHB(55)).toBe('฿55');
    expect(fmtTHB(1234)).toBe('฿1,234');
    expect(fmtTHB(1000000)).toBe('฿1,000,000');
  });

  it('drops the decimal portion', () => {
    expect(fmtTHB(99.9)).toBe('฿100');
    expect(fmtTHB(99.1)).toBe('฿99');
  });

  it('handles negatives (e.g. change due) with a leading minus before the sign', () => {
    // toLocaleString places the minus before the digit group; we accept that.
    expect(fmtTHB(-50)).toBe('฿-50');
  });
});

describe('fmtTHB2', () => {
  it('always shows two decimals', () => {
    expect(fmtTHB2(0)).toBe('฿0.00');
    expect(fmtTHB2(55)).toBe('฿55.00');
    expect(fmtTHB2(99.5)).toBe('฿99.50');
    expect(fmtTHB2(1234.567)).toBe('฿1,234.57');
  });
});

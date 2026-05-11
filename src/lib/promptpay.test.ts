import { buildPromptPayPayload, isValidPromptPayId } from './promptpay';

// Parser for assertions — turns the EMVCo TLV payload into a map for easy
// lookups. The CRC trailer (id "63") sits at the end and is included.
function parseTLV(payload: string): Record<string, string> {
  const out: Record<string, string> = {};
  let i = 0;
  while (i < payload.length) {
    const id = payload.slice(i, i + 2);
    const len = parseInt(payload.slice(i + 2, i + 4), 10);
    out[id] = payload.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return out;
}

// Re-implementation of CRC-16/CCITT-FALSE for verification (init 0xFFFF,
// poly 0x1021, no reflection, xorout 0x0000).
function expectedCrc(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

describe('isValidPromptPayId', () => {
  it.each([
    ['10-digit phone', '0812345678'],
    ['9-digit phone (without leading 0)', '812345678'],
    ['13-digit national ID', '1234567890123'],
    ['11-digit international format', '66812345678'],
    ['15-digit e-wallet', '004999000000001'],
    ['formatted phone with dashes', '081-234-5678'],
  ])('accepts %s', (_label, id) => {
    expect(isValidPromptPayId(id)).toBe(true);
  });

  it.each([
    ['empty string', ''],
    ['too short', '12345'],
    ['undefined', undefined],
    ['null', null],
  ])('rejects %s', (_label, id) => {
    expect(isValidPromptPayId(id as string | undefined | null)).toBe(false);
  });
});

describe('buildPromptPayPayload', () => {
  it('throws on unrecognised IDs', () => {
    expect(() => buildPromptPayPayload({ id: 'abc' })).toThrow(/Invalid/);
    expect(() => buildPromptPayPayload({ id: '12345' })).toThrow(/Invalid/);
  });

  it('emits a static QR (POI 11) when no amount is provided', () => {
    const payload = buildPromptPayPayload({ id: '0812345678' });
    const tlv = parseTLV(payload);
    expect(tlv['00']).toBe('01');
    expect(tlv['01']).toBe('11');
    expect(tlv['54']).toBeUndefined();
  });

  it('emits a dynamic QR (POI 12) with the amount when provided', () => {
    const payload = buildPromptPayPayload({ id: '0812345678', amount: 123 });
    const tlv = parseTLV(payload);
    expect(tlv['01']).toBe('12');
    expect(tlv['54']).toBe('123.00');
  });

  it('formats the amount to two decimals', () => {
    expect(parseTLV(buildPromptPayPayload({ id: '0812345678', amount: 99.5 }))['54']).toBe(
      '99.50',
    );
    expect(parseTLV(buildPromptPayPayload({ id: '0812345678', amount: 1234.567 }))['54']).toBe(
      '1234.57',
    );
  });

  it('falls back to static when amount is 0 or negative', () => {
    expect(parseTLV(buildPromptPayPayload({ id: '0812345678', amount: 0 }))['01']).toBe('11');
    expect(parseTLV(buildPromptPayPayload({ id: '0812345678', amount: -5 }))['01']).toBe('11');
  });

  it('encodes a 10-digit phone as 0066xxxxxxxxx under merchant tag 01', () => {
    const payload = buildPromptPayPayload({ id: '0812345678' });
    const tlv = parseTLV(payload);
    const merchant = parseTLV(tlv['29']);
    expect(merchant['00']).toBe('A000000677010111');
    expect(merchant['01']).toBe('0066812345678');
  });

  it('encodes a 13-digit national ID under merchant tag 02', () => {
    const payload = buildPromptPayPayload({ id: '1234567890123' });
    const merchant = parseTLV(parseTLV(payload)['29']);
    expect(merchant['02']).toBe('1234567890123');
  });

  it('treats a 13-digit value starting with 0066 as a pre-formatted phone (tag 01)', () => {
    const payload = buildPromptPayPayload({ id: '0066812345678' });
    const merchant = parseTLV(parseTLV(payload)['29']);
    expect(merchant['01']).toBe('0066812345678');
    expect(merchant['02']).toBeUndefined();
  });

  it('encodes a 15-digit e-wallet under merchant tag 03', () => {
    const payload = buildPromptPayPayload({ id: '004999000000001' });
    const merchant = parseTLV(parseTLV(payload)['29']);
    expect(merchant['03']).toBe('004999000000001');
  });

  it('normalises a 9-digit phone (no leading 0)', () => {
    const payload = buildPromptPayPayload({ id: '812345678' });
    expect(parseTLV(parseTLV(payload)['29'])['01']).toBe('0066812345678');
  });

  it('normalises an 11-digit phone starting with 66', () => {
    const payload = buildPromptPayPayload({ id: '66812345678' });
    expect(parseTLV(parseTLV(payload)['29'])['01']).toBe('0066812345678');
  });

  it('strips non-digits before parsing', () => {
    const payload = buildPromptPayPayload({ id: '081-234-5678' });
    expect(parseTLV(parseTLV(payload)['29'])['01']).toBe('0066812345678');
  });

  it('includes currency=764 (THB) and country=TH', () => {
    const tlv = parseTLV(buildPromptPayPayload({ id: '0812345678' }));
    expect(tlv['53']).toBe('764');
    expect(tlv['58']).toBe('TH');
  });

  it('appends a 4-character CRC over the body including the 6304 tag prefix', () => {
    const payload = buildPromptPayPayload({ id: '0812345678', amount: 100 });
    // body already includes the literal "6304" tag prefix that the CRC
    // tag begins with — the spec computes the CRC over exactly this.
    const body = payload.slice(0, -4);
    const crc = payload.slice(-4);
    expect(crc).toHaveLength(4);
    expect(crc).toBe(expectedCrc(body));
    expect(payload.slice(-8, -4)).toBe('6304');
  });
});

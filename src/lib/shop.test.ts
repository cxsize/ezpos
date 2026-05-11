// We re-import shop.ts inside each test after mutating process.env, so the
// module re-reads the env at call time.
import { shopConfig } from './shop';

const KEYS = [
  'EXPO_PUBLIC_SHOP_NAME',
  'EXPO_PUBLIC_SHOP_SUBTITLE',
  'EXPO_PUBLIC_SHOP_ADDRESS',
  'EXPO_PUBLIC_SHOP_PHONE',
  'EXPO_PUBLIC_SHOP_TAX_ID',
  'EXPO_PUBLIC_REGISTER_ID',
  'EXPO_PUBLIC_PROMPTPAY_ID',
  'EXPO_PUBLIC_OWNER_UID',
] as const;

describe('shopConfig', () => {
  let original: Record<string, string | undefined>;

  beforeEach(() => {
    original = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
    for (const k of KEYS) delete process.env[k];
  });

  afterEach(() => {
    for (const k of KEYS) {
      if (original[k] === undefined) delete process.env[k];
      else process.env[k] = original[k];
    }
  });

  it('returns sensible defaults when no env vars are set', () => {
    expect(shopConfig()).toEqual({
      name: 'cakethakae',
      subtitle: 'เค้กท่าแค',
      address: '',
      phone: '',
      taxId: '',
      registerId: '01',
      promptpayId: '',
      ownerUid: '',
    });
  });

  it('reads every field from EXPO_PUBLIC_* env vars when present', () => {
    process.env.EXPO_PUBLIC_SHOP_NAME = 'Shop X';
    process.env.EXPO_PUBLIC_SHOP_SUBTITLE = 'subtitle';
    process.env.EXPO_PUBLIC_SHOP_ADDRESS = 'addr';
    process.env.EXPO_PUBLIC_SHOP_PHONE = '02-111-2222';
    process.env.EXPO_PUBLIC_SHOP_TAX_ID = '0105500000000';
    process.env.EXPO_PUBLIC_REGISTER_ID = '07';
    process.env.EXPO_PUBLIC_PROMPTPAY_ID = '0812345678';
    process.env.EXPO_PUBLIC_OWNER_UID = 'uid-xyz';

    expect(shopConfig()).toEqual({
      name: 'Shop X',
      subtitle: 'subtitle',
      address: 'addr',
      phone: '02-111-2222',
      taxId: '0105500000000',
      registerId: '07',
      promptpayId: '0812345678',
      ownerUid: 'uid-xyz',
    });
  });
});

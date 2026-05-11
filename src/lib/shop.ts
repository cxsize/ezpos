// Single source of truth for shop metadata read from EXPO_PUBLIC_* env vars.
// Used by the receipt printer (mock + BLE) and PromptPay QR generator.

export type ShopConfig = {
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  taxId: string;
  registerId: string;
  promptpayId: string;
  ownerUid: string;
};

export function shopConfig(): ShopConfig {
  return {
    name: process.env.EXPO_PUBLIC_SHOP_NAME ?? 'cakethakae',
    subtitle: process.env.EXPO_PUBLIC_SHOP_SUBTITLE ?? 'เค้กท่าแค',
    address: process.env.EXPO_PUBLIC_SHOP_ADDRESS ?? '',
    phone: process.env.EXPO_PUBLIC_SHOP_PHONE ?? '',
    taxId: process.env.EXPO_PUBLIC_SHOP_TAX_ID ?? '',
    registerId: process.env.EXPO_PUBLIC_REGISTER_ID ?? '01',
    promptpayId: process.env.EXPO_PUBLIC_PROMPTPAY_ID ?? '',
    ownerUid: process.env.EXPO_PUBLIC_OWNER_UID ?? '',
  };
}

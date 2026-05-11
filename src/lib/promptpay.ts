// PromptPay QR payload generator — EMVCo MPM (Merchant Presented Mode) format
// with the Thailand PromptPay merchant tag (GUID A000000677010111).
//
// Spec: https://www.emvco.com/wp-content/uploads/documents/EMVCo-Merchant-Presented-QR-Specification-v1-1.pdf
// Bank of Thailand mapping for tag 29:
//   00 = AID ("A000000677010111")
//   01 = Mobile (13 digits, 0066xxxxxxxxx)
//   02 = National / Tax ID (13 digits)
//   03 = E-wallet ID (15 digits)
//
// Static QR (no amount) uses POI "11"; dynamic (amount included) uses "12".

function tlv(id: string, value: string): string {
  if (value.length > 99) throw new Error(`TLV value too long for id=${id}`);
  return `${id}${value.length.toString().padStart(2, '0')}${value}`;
}

// CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF, no reflection, xorout 0x0000)
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Normalize a PromptPay target. Returns null if unrecognised. */
function normalizeTarget(raw: string): { merchantId: '01' | '02' | '03'; value: string } | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 13) {
    // 13-digit input could be a national ID OR an already-formatted phone.
    // PromptPay convention: phones are prefixed "0066", so detect that.
    if (digits.startsWith('0066')) return { merchantId: '01', value: digits };
    return { merchantId: '02', value: digits };
  }
  if (digits.length === 15) return { merchantId: '03', value: digits };
  if (digits.length === 10 && digits.startsWith('0')) {
    return { merchantId: '01', value: ('0066' + digits.slice(1)).padStart(13, '0') };
  }
  if (digits.length === 9) {
    return { merchantId: '01', value: ('0066' + digits).padStart(13, '0') };
  }
  if (digits.length === 11 && digits.startsWith('66')) {
    return { merchantId: '01', value: ('00' + digits).padStart(13, '0') };
  }
  return null;
}

export type PromptPayOptions = {
  id: string;
  amount?: number;
};

/** Build the PromptPay QR payload string. Throws on invalid id. */
export function buildPromptPayPayload({ id, amount }: PromptPayOptions): string {
  const target = normalizeTarget(id);
  if (!target) throw new Error('Invalid PromptPay ID');

  const merchant = tlv('00', 'A000000677010111') + tlv(target.merchantId, target.value);

  let payload = '';
  payload += tlv('00', '01'); // Payload Format Indicator
  payload += tlv('01', amount && amount > 0 ? '12' : '11'); // POI: static (11) / dynamic (12)
  payload += tlv('29', merchant); // Merchant Account Information
  payload += tlv('53', '764'); // Currency: THB (ISO 4217)
  if (amount && amount > 0) payload += tlv('54', amount.toFixed(2));
  payload += tlv('58', 'TH'); // Country code

  // CRC is computed over `payload + "6304"` (the prefix of the CRC tag itself).
  const crc = crc16(payload + '6304');
  payload += '6304' + crc;
  return payload;
}

/** True if the configured PromptPay ID parses cleanly. */
export function isValidPromptPayId(id: string | undefined | null): boolean {
  if (!id) return false;
  return normalizeTarget(id) !== null;
}

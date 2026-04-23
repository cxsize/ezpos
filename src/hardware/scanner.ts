// BLE HID barcode scanners present as keyboards — scans appear as text input
// ending with a newline. We keep a singleton "handler" that the Sale screen's
// hidden TextInput can register a callback with. The same subscription is also
// used by the Discount modal to listen for coupon barcodes.
type Handler = (code: string) => void;

let handler: Handler | null = null;

export function setScanHandler(h: Handler | null) {
  handler = h;
}

export function emitScan(code: string) {
  const s = (code || '').trim();
  if (!s) return;
  handler?.(s);
}

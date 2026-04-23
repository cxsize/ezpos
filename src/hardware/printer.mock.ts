// Mock printer — pretends to print a receipt by turning the sale into
// human-readable text lines and broadcasting them through the dev bus, where
// the DevPanel picks them up and shows them. Also supports simulated failure.

import { padLine } from './escpos';
import { devBus } from './devbus';
import type { BleDevice, PrinterApi } from './printer';
import type { Sale } from '~/types';

let connected: BleDevice | null = null;
let failNext = false;

const MOCK_DEVICES: BleDevice[] = [
  { id: 'MOCK:PRINTER:001', name: 'Mock XP-80 Printer' },
  { id: 'MOCK:PRINTER:002', name: 'Mock Rongta RP58' },
];

export const scanPrinters: PrinterApi['scanPrinters'] = async () => MOCK_DEVICES;

export const kickDrawer: PrinterApi['kickDrawer'] = async () => {
  devBus.emit('drawer:kick');
};

export const printReceipt: PrinterApi['printReceipt'] = async (sale: Sale, { isTH }) => {
  if (failNext) {
    failNext = false;
    throw new Error('Mock printer: simulated failure');
  }

  const cols = 32;
  const lines: string[] = [];
  const shop = {
    name: process.env.EXPO_PUBLIC_SHOP_NAME ?? 'cakethakae',
    sub: process.env.EXPO_PUBLIC_SHOP_SUBTITLE ?? 'เค้กท่าแค',
    addr: process.env.EXPO_PUBLIC_SHOP_ADDRESS ?? '',
    phone: process.env.EXPO_PUBLIC_SHOP_PHONE ?? '',
  };
  const date = new Date(sale.createdAt);
  const dateStr = date.toLocaleDateString(isTH ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  lines.push(shop.name.toUpperCase());
  lines.push(shop.sub);
  if (shop.addr) lines.push(shop.addr);
  if (shop.phone) lines.push(`Tel ${shop.phone}`);
  lines.push('');
  lines.push(padLine(isTH ? 'ใบเสร็จ' : 'Receipt', sale.receiptNo, cols));
  lines.push(padLine(dateStr, timeStr, cols));
  lines.push(padLine(isTH ? 'พนักงาน' : 'Cashier', sale.cashierName, cols));
  lines.push('-'.repeat(cols));
  for (const i of sale.items) {
    const name = isTH ? i.thName : i.name;
    lines.push(padLine(`${i.qty}x ${name}`, String(i.price * i.qty), cols));
  }
  lines.push('-'.repeat(cols));
  lines.push(padLine(isTH ? 'ยอดรวม' : 'Subtotal', String(sale.subtotal), cols));
  if (sale.discountAmt > 0) {
    const label =
      (isTH ? 'ส่วนลด' : 'Discount') +
      (sale.discount.type !== 'none' && 'code' in sale.discount && sale.discount.code
        ? ` · ${sale.discount.code}`
        : '');
    lines.push(padLine(label, `-${sale.discountAmt}`, cols));
  }
  lines.push(padLine(isTH ? 'ยอดชำระ' : 'TOTAL', String(sale.total), cols));
  lines.push('-'.repeat(cols));
  if (sale.method === 'cash' && sale.cashTendered != null) {
    lines.push(padLine(isTH ? 'เงินสด' : 'Cash', String(sale.cashTendered), cols));
    lines.push(padLine(isTH ? 'เงินทอน' : 'Change', String(sale.change ?? 0), cols));
  } else {
    lines.push(padLine(isTH ? 'พร้อมเพย์' : 'PromptPay', String(sale.total), cols));
  }
  lines.push('');
  lines.push(isTH ? 'รวม VAT 7% แล้ว' : 'VAT included (7%)');
  lines.push(isTH ? 'ขอบคุณค่ะ แล้วพบกันใหม่' : 'Thank you — see you again');

  // Print is near-instant but we add a tiny delay so the "printing…" pill
  // shows for a beat, matching real ESC/POS timing.
  await new Promise((r) => setTimeout(r, 350));

  devBus.emit('receipt:printed', { sale, lines });
  if (sale.method === 'cash') devBus.emit('drawer:kick');
};

export const disconnectPrinter: PrinterApi['disconnectPrinter'] = async () => {
  connected = null;
};

export const printerPermissionsRequired: PrinterApi['printerPermissionsRequired'] = () => [];

export const isMockPrinter = true;

// Exposed for the DevPanel
export function mockForceFailNextPrint() {
  failNext = true;
}

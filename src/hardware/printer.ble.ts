// Bluetooth Low Energy bridge to a generic ESC/POS 80mm thermal printer.
// We discover the first writable characteristic on the printer service and
// stream payload bytes to it in <=180-byte chunks (Android MTU ceiling).
//
// To pair a printer: open Settings → "Printer" and pick from the scanned list.
// Selection persists in AsyncStorage via state/settings.ts.

import { BleManager, type Device, type Characteristic } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { EscPos, padLine } from './escpos';
import { useSettings } from '~/state/settings';
import type { Sale } from '~/types';

const CHUNK = 180;

let manager: BleManager | null = null;
function mgr() {
  return (manager ??= new BleManager());
}

let connected: Device | null = null;
let writeChar: Characteristic | null = null;

async function ensureConnected(): Promise<{ device: Device; char: Characteristic } | null> {
  const id = useSettings.getState().printerId;
  if (!id) return null;

  if (connected?.id === id && writeChar) {
    const stillConnected = await connected.isConnected();
    if (stillConnected) return { device: connected, char: writeChar };
  }

  const device = await mgr().connectToDevice(id, { requestMTU: 247 });
  await device.discoverAllServicesAndCharacteristics();
  const services = await device.services();
  for (const s of services) {
    const chars = await s.characteristics();
    const candidate = chars.find((c) => c.isWritableWithResponse || c.isWritableWithoutResponse);
    if (candidate) {
      connected = device;
      writeChar = candidate;
      return { device, char: candidate };
    }
  }
  throw new Error('No writable BLE characteristic found on printer');
}

async function write(bytes: Uint8Array) {
  const pair = await ensureConnected();
  if (!pair) throw new Error('Printer not configured');
  const { char } = pair;
  const writer = char.isWritableWithoutResponse
    ? char.writeWithoutResponse.bind(char)
    : char.writeWithResponse.bind(char);
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, i + CHUNK);
    const b64 = Buffer.from(slice).toString('base64');
    await writer(b64);
  }
}

export type BleDevice = { id: string; name: string | null };

export async function scanPrinters(timeoutMs = 6000): Promise<BleDevice[]> {
  const found = new Map<string, BleDevice>();
  return new Promise((resolve, reject) => {
    mgr().startDeviceScan(null, { allowDuplicates: false }, (err, device) => {
      if (err) {
        mgr().stopDeviceScan();
        reject(err);
        return;
      }
      if (device && (device.name || device.localName)) {
        const name = device.name ?? device.localName ?? null;
        if (!/(printer|pos|bt-|rpp|xp-|tp|mpt|escpos)/i.test(name ?? '')) {
          // Keep anyway — users can pick unrecognized names
        }
        found.set(device.id, { id: device.id, name });
      }
    });
    setTimeout(() => {
      mgr().stopDeviceScan();
      resolve([...found.values()]);
    }, timeoutMs);
  });
}

export async function kickDrawer(): Promise<void> {
  const p = new EscPos().init().kickDrawer();
  await write(p.toBytes());
}

export async function printReceipt(sale: Sale, opts: { isTH: boolean }): Promise<void> {
  const cols = 32;
  const shop = {
    name: process.env.EXPO_PUBLIC_SHOP_NAME ?? 'cakethakae',
    sub: process.env.EXPO_PUBLIC_SHOP_SUBTITLE ?? 'เค้กท่าแค',
    addr: process.env.EXPO_PUBLIC_SHOP_ADDRESS ?? '',
    phone: process.env.EXPO_PUBLIC_SHOP_PHONE ?? '',
  };

  const date = new Date(sale.createdAt);
  const dateStr = date.toLocaleDateString(opts.isTH ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const p = new EscPos().init();

  p.align(1).size(2, 2).text(shop.name).newline();
  p.size(1, 1).text(shop.sub).newline();
  if (shop.addr) p.text(shop.addr).newline();
  if (shop.phone) p.text(`Tel ${shop.phone}`).newline();

  p.align(0).newline();
  p.text(padLine(opts.isTH ? 'ใบเสร็จ' : 'Receipt', sale.receiptNo, cols)).newline();
  p.text(padLine(dateStr, timeStr, cols)).newline();
  p.text(padLine(opts.isTH ? 'พนักงาน' : 'Cashier', sale.cashierName, cols)).newline();
  p.hr(cols);

  for (const i of sale.items) {
    const name = opts.isTH ? i.thName : i.name;
    const right = `${i.price * i.qty}`;
    p.text(padLine(`${i.qty}x ${name}`, right, cols)).newline();
  }

  p.hr(cols, '-');
  p.text(padLine(opts.isTH ? 'ยอดรวม' : 'Subtotal', String(sale.subtotal), cols)).newline();
  if (sale.discountAmt > 0) {
    const label = (opts.isTH ? 'ส่วนลด' : 'Discount') +
      (sale.discount.type !== 'none' && 'code' in sale.discount && sale.discount.code ? ` · ${sale.discount.code}` : '');
    p.text(padLine(label, `-${sale.discountAmt}`, cols)).newline();
  }
  p.bold(true).size(2, 1);
  p.text(padLine(opts.isTH ? 'ยอดชำระ' : 'TOTAL', String(sale.total), cols / 2)).newline();
  p.bold(false).size(1, 1);
  p.hr(cols);

  if (sale.method === 'cash' && sale.cashTendered != null) {
    p.text(padLine(opts.isTH ? 'เงินสด' : 'Cash', String(sale.cashTendered), cols)).newline();
    p.text(padLine(opts.isTH ? 'เงินทอน' : 'Change', String(sale.change ?? 0), cols)).newline();
  } else {
    p.text(padLine(opts.isTH ? 'พร้อมเพย์' : 'PromptPay', String(sale.total), cols)).newline();
  }

  p.newline();
  p.align(1);
  p.text(opts.isTH ? 'รวม VAT 7% แล้ว' : 'VAT included (7%)').newline(2);
  p.text(opts.isTH ? 'ขอบคุณค่ะ แล้วพบกันใหม่' : 'Thank you — see you again').newline();

  if (sale.method === 'cash') p.kickDrawer();
  p.cut();

  await write(p.toBytes());
}

export async function disconnectPrinter() {
  if (connected) {
    try {
      await mgr().cancelDeviceConnection(connected.id);
    } catch {}
  }
  connected = null;
  writeChar = null;
}

export function printerPermissionsRequired(): string[] {
  if (Platform.OS === 'android') {
    return [
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.ACCESS_FINE_LOCATION',
    ];
  }
  return [];
}

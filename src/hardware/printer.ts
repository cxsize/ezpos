// Cross-platform shape for the printer service. The real BLE implementation
// lives in printer.ble.ts (loaded only on native) and the mock in
// printer.mock.ts. At runtime, we swap between them:
//
//   printer.ts          → default (web): mock only
//   printer.native.ts   → native: BLE or mock, depending on env
//
// That keeps `react-native-ble-plx` out of the web bundle.

import type { Sale } from '~/types';

export type BleDevice = { id: string; name: string | null };

export type PrinterApi = {
  scanPrinters: (timeoutMs?: number) => Promise<BleDevice[]>;
  kickDrawer: () => Promise<void>;
  printReceipt: (sale: Sale, opts: { isTH: boolean }) => Promise<void>;
  disconnectPrinter: () => Promise<void>;
  printerPermissionsRequired: () => string[];
  isMock: boolean;
};

import * as mock from './printer.mock';

// Web (and any env that resolves this file) always uses the mock.
export const scanPrinters: PrinterApi['scanPrinters'] = mock.scanPrinters;
export const kickDrawer: PrinterApi['kickDrawer'] = mock.kickDrawer;
export const printReceipt: PrinterApi['printReceipt'] = mock.printReceipt;
export const disconnectPrinter: PrinterApi['disconnectPrinter'] = mock.disconnectPrinter;
export const printerPermissionsRequired: PrinterApi['printerPermissionsRequired'] =
  mock.printerPermissionsRequired;
export const isMockPrinter = true;

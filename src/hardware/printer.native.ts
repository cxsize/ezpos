// Native entrypoint — picks between the real BLE impl and the mock based on
// EXPO_PUBLIC_MOCK_HARDWARE. The import of printer.ble.ts is static but
// Metro only bundles this file on native, so web bundles never pull in
// react-native-ble-plx.

import * as mock from './printer.mock';
import * as ble from './printer.ble';

const USE_MOCK = process.env.EXPO_PUBLIC_MOCK_HARDWARE === 'true';
const impl = USE_MOCK ? mock : ble;

export const scanPrinters = impl.scanPrinters;
export const kickDrawer = impl.kickDrawer;
export const printReceipt = impl.printReceipt;
export const disconnectPrinter = impl.disconnectPrinter;
export const printerPermissionsRequired = impl.printerPermissionsRequired;
export const isMockPrinter = USE_MOCK;

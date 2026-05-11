// Jest setup — runs before each test file. Polyfills TextEncoder/TextDecoder
// so escpos can encode UTF-8 in the Node test environment.
import { TextEncoder, TextDecoder } from 'util';

const g = globalThis as unknown as {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
};

if (typeof g.TextEncoder === 'undefined') g.TextEncoder = TextEncoder;
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = TextDecoder;

// Minimal ESC/POS command builder. We only emit commands needed for an 80mm
// thermal printer: init, left/center align, bold, size x2, line feeds, cut,
// and the cash-drawer kick. Text is encoded as UTF-8 — most modern ESC/POS
// printers (Xprinter, Rongta, Epson TM-m30) can render Thai directly.
const ESC = 0x1b;
const GS = 0x1d;

export class EscPos {
  private chunks: Uint8Array[] = [];

  private push(bytes: number[]) {
    this.chunks.push(Uint8Array.from(bytes));
    return this;
  }

  init() {
    return this.push([ESC, 0x40]);
  }

  text(s: string) {
    const buf = new TextEncoder().encode(s);
    this.chunks.push(buf);
    return this;
  }

  newline(n = 1) {
    for (let i = 0; i < n; i++) this.chunks.push(Uint8Array.from([0x0a]));
    return this;
  }

  /** 0 = left, 1 = center, 2 = right */
  align(mode: 0 | 1 | 2) {
    return this.push([ESC, 0x61, mode]);
  }

  bold(on: boolean) {
    return this.push([ESC, 0x45, on ? 1 : 0]);
  }

  /** width/height multipliers 1..8 */
  size(w: 1 | 2 | 3, h: 1 | 2 | 3) {
    const n = ((w - 1) << 4) | (h - 1);
    return this.push([GS, 0x21, n]);
  }

  hr(cols = 32, ch = '-') {
    return this.text(ch.repeat(cols)).newline();
  }

  /** Open the cash drawer via the printer's DK pin (pin 2). */
  kickDrawer() {
    return this.push([ESC, 0x70, 0x00, 0x19, 0xfa]);
  }

  /** Partial cut. */
  cut() {
    this.newline(4);
    return this.push([GS, 0x56, 0x01]);
  }

  toBytes(): Uint8Array {
    const len = this.chunks.reduce((n, c) => n + c.length, 0);
    const out = new Uint8Array(len);
    let off = 0;
    for (const c of this.chunks) {
      out.set(c, off);
      off += c.length;
    }
    return out;
  }
}

export function padLine(left: string, right: string, cols = 32) {
  const maxLeft = Math.max(0, cols - right.length - 1);
  const l = left.length > maxLeft ? left.slice(0, maxLeft - 1) + '…' : left;
  const gap = ' '.repeat(Math.max(1, cols - l.length - right.length));
  return l + gap + right;
}

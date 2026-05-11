import { EscPos, padLine } from './escpos';

describe('padLine', () => {
  it('left-aligns the label and right-aligns the value within `cols`', () => {
    const out = padLine('Total', '100', 16);
    expect(out).toHaveLength(16);
    expect(out.startsWith('Total')).toBe(true);
    expect(out.endsWith('100')).toBe(true);
  });

  it('keeps at least one space between sides', () => {
    const out = padLine('Subtotal', '999999', 16);
    expect(out).toHaveLength(16);
    // The gap between label and value must be ≥ 1 char.
    expect(/[A-Za-z0-9] {1,}[0-9]/.test(out)).toBe(true);
  });

  it('truncates long labels with an ellipsis', () => {
    const out = padLine('This-is-a-very-long-name', '50', 16);
    expect(out).toHaveLength(16);
    expect(out).toContain('…');
    expect(out.endsWith('50')).toBe(true);
  });

  it('defaults to a 32-column line', () => {
    expect(padLine('a', 'b').length).toBe(32);
  });
});

describe('EscPos', () => {
  it('init emits ESC @ (0x1B 0x40)', () => {
    const bytes = new EscPos().init().toBytes();
    expect(Array.from(bytes)).toEqual([0x1b, 0x40]);
  });

  it('text() encodes UTF-8 (incl. multi-byte Thai)', () => {
    const bytes = new EscPos().text('ขอบคุณ').toBytes();
    // ขอบคุณ in UTF-8 is 18 bytes — 6 chars × 3 bytes each.
    expect(bytes.length).toBe(18);
  });

  it('newline(n) emits n line feeds', () => {
    expect(Array.from(new EscPos().newline().toBytes())).toEqual([0x0a]);
    expect(Array.from(new EscPos().newline(3).toBytes())).toEqual([0x0a, 0x0a, 0x0a]);
  });

  it('align/bold/size emit the right ESC/POS commands', () => {
    expect(Array.from(new EscPos().align(1).toBytes())).toEqual([0x1b, 0x61, 1]);
    expect(Array.from(new EscPos().align(2).toBytes())).toEqual([0x1b, 0x61, 2]);
    expect(Array.from(new EscPos().bold(true).toBytes())).toEqual([0x1b, 0x45, 1]);
    expect(Array.from(new EscPos().bold(false).toBytes())).toEqual([0x1b, 0x45, 0]);
    // size(w,h) packs (w-1)<<4 | (h-1)
    expect(Array.from(new EscPos().size(2, 2).toBytes())).toEqual([0x1d, 0x21, 0x11]);
    expect(Array.from(new EscPos().size(1, 1).toBytes())).toEqual([0x1d, 0x21, 0x00]);
    expect(Array.from(new EscPos().size(3, 3).toBytes())).toEqual([0x1d, 0x21, 0x22]);
  });

  it('hr() emits the given character repeated cols times plus a newline', () => {
    const bytes = new EscPos().hr(5, '-').toBytes();
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('-----');
    expect(bytes[5]).toBe(0x0a);
  });

  it('kickDrawer emits ESC p (drawer pin) command', () => {
    const out = Array.from(new EscPos().kickDrawer().toBytes());
    expect(out.slice(0, 3)).toEqual([0x1b, 0x70, 0x00]);
  });

  it('cut() pads with line feeds then emits GS V 1', () => {
    const out = Array.from(new EscPos().cut().toBytes());
    expect(out.slice(0, 4)).toEqual([0x0a, 0x0a, 0x0a, 0x0a]);
    expect(out.slice(4)).toEqual([0x1d, 0x56, 0x01]);
  });

  it('chains operations and toBytes() concatenates them in order', () => {
    const out = Array.from(new EscPos().init().text('A').newline().bold(true).toBytes());
    expect(out).toEqual([0x1b, 0x40, 0x41, 0x0a, 0x1b, 0x45, 1]);
  });

  it('toBytes() on a fresh builder returns an empty Uint8Array', () => {
    const out = new EscPos().toBytes();
    expect(out).toBeInstanceOf(Uint8Array);
    expect(out.length).toBe(0);
  });
});

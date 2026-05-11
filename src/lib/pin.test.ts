import { hashPin, verifyPin } from './pin';

// Hashing runs 20k SHA-256 rounds against Node's crypto via the test mock.
// That's still well under a second per call but to keep the suite snappy
// we share results across assertions.
jest.setTimeout(20_000);

describe('hashPin / verifyPin', () => {
  it('produces a versioned $-delimited string of the right shape', async () => {
    const hash = await hashPin('1234');
    const parts = hash.split('$');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe('v1');
    // salt is 16 bytes → 32 hex chars
    expect(parts[1]).toMatch(/^[0-9a-f]{32}$/);
    // hash is SHA-256 → 64 hex chars
    expect(parts[2]).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces a different salt + hash every call (no determinism leak)', async () => {
    const a = await hashPin('1234');
    const b = await hashPin('1234');
    expect(a).not.toBe(b);
  });

  it('verifies the correct PIN', async () => {
    const hash = await hashPin('4242');
    await expect(verifyPin('4242', hash)).resolves.toBe(true);
  });

  it('rejects the wrong PIN', async () => {
    const hash = await hashPin('4242');
    await expect(verifyPin('1234', hash)).resolves.toBe(false);
  });

  it('rejects garbage hash strings', async () => {
    await expect(verifyPin('1234', '')).resolves.toBe(false);
    await expect(verifyPin('1234', 'plaintext')).resolves.toBe(false);
    await expect(verifyPin('1234', 'v9$abc$def')).resolves.toBe(false);
    await expect(verifyPin('1234', 'v1$$')).resolves.toBe(false);
  });

  it('rejects a v1 record with a hash of the wrong length (length-mismatch branch)', async () => {
    const truncated = 'v1$abc123$shorthash';
    await expect(verifyPin('1234', truncated)).resolves.toBe(false);
  });
});

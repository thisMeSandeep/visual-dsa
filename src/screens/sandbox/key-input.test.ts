import { parseKey } from './key-input';

describe('parseKey', () => {
  it('accepts short names, ignoring spaces around them', () => {
    expect(parseKey(' Sid ')).toEqual({ ok: true, key: 'Sid' });
  });

  it('explains empty, non-letter and long keys', () => {
    expect(parseKey('')).toEqual({ ok: false, problem: 'Type a key first, like Sid.' });
    expect(parseKey('R2D2')).toEqual({
      ok: false,
      problem: 'Keys are names made of letters, like Sid.',
    });
    expect(parseKey('Abigail')).toEqual({
      ok: false,
      problem: 'At most 6 letters, so the key fits its box.',
    });
  });
});

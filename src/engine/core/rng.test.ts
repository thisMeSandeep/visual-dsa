import { config } from '@/config';

import { createRng } from './rng';

const draws = (seed: number, count = 5) => {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => rng.next());
};

describe('createRng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(draws(7)).toEqual(draws(7));
  });

  it('gives different sequences for different seeds', () => {
    expect(draws(7)).not.toEqual(draws(8));
  });

  it('produces floats in [0, 1)', () => {
    const values = draws(123, 1000);
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it('produces whole numbers within both bounds, and reaches both ends', () => {
    const rng = createRng(1);
    const values = Array.from({ length: 2000 }, () => rng.int(0, 9));
    expect(values.every((v) => Number.isInteger(v) && v >= 0 && v <= 9)).toBe(true);
    expect(new Set(values)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });

  it('picks from a list, or undefined from an empty one', () => {
    const rng = createRng(3);
    expect(['a', 'b', 'c']).toContain(rng.pick(['a', 'b', 'c']));
    expect(rng.pick([])).toBeUndefined();
  });

  it('shuffles a copy into a permutation, the same way for the same seed', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const a = createRng(9).shuffle(input);
    const b = createRng(9).shuffle(input);

    expect(a).toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('uses the configured default seed', () => {
    const unseeded = createRng();
    const seeded = createRng(config.engine.defaultSeed);
    expect([unseeded.next(), unseeded.next()]).toEqual([seeded.next(), seeded.next()]);
  });
});

import { levelGeometry, parseLevels } from './levels';

describe('parseLevels', () => {
  it('reads the ranges per level', () => {
    expect(parseLevels('0-3;0-1,1-3;1-2,2-3')).toEqual([
      [[0, 3]],
      [
        [0, 1],
        [1, 3],
      ],
      [
        [1, 2],
        [2, 3],
      ],
    ]);
  });

  it('ignores missing or broken meta', () => {
    expect(parseLevels(undefined)).toEqual([]);
    expect(parseLevels('0-3;x')).toEqual([]);
  });
});

describe('levelGeometry', () => {
  it('adds a gap at every split from this level up', () => {
    const geometry = levelGeometry(parseLevels('0-3;0-1,1-3;1-2,2-3'));
    expect([0, 1, 2].map((index) => geometry.gapsBefore(0, index))).toEqual([0, 0, 0]);
    expect([0, 1, 2].map((index) => geometry.gapsBefore(1, index))).toEqual([0, 1, 1]);
    expect([1, 2].map((index) => geometry.gapsBefore(2, index))).toEqual([1, 2]);
    expect(geometry.maxGaps).toBe(2);
    expect(geometry.gapsAt(1)).toBe(1);
  });
});

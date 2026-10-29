import { StepLimitError, checkItemCount, checkValue, isStepLimitReached } from './limits';

describe('isStepLimitReached', () => {
  it('is reached at the limit, not before', () => {
    expect(isStepLimitReached(2, 3)).toBe(false);
    expect(isStepLimitReached(3, 3)).toBe(true);
  });
});

describe('checkItemCount', () => {
  it('allows up to the limit', () => {
    expect(checkItemCount(12, 12)).toBeNull();
  });

  it('explains when there are too many items', () => {
    expect(checkItemCount(13, 12)).toEqual({
      code: 'engine.too-many-items',
      message: { key: 'engine.too-many-items', params: { count: 13, limit: 12 } },
    });
  });
});

describe('checkValue', () => {
  const range = { min: 0, max: 99 };

  it('allows whole numbers in range, including both ends', () => {
    expect(checkValue(0, range)).toBeNull();
    expect(checkValue(99, range)).toBeNull();
  });

  it('rejects values outside the range', () => {
    expect(checkValue(100, range)?.code).toBe('engine.value-out-of-range');
    expect(checkValue(-1, range)?.code).toBe('engine.value-out-of-range');
  });

  it('rejects numbers that are not whole', () => {
    expect(checkValue(4.5, range)?.code).toBe('engine.not-a-whole-number');
    expect(checkValue(Number.NaN, range)?.code).toBe('engine.not-a-whole-number');
  });
});

describe('StepLimitError', () => {
  it('carries the limit', () => {
    const error = new StepLimitError(2000);
    expect(error).toBeInstanceOf(Error);
    expect(error.limit).toBe(2000);
  });
});

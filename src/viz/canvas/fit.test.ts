import { fitContent } from './fit';

describe('fitContent', () => {
  it('keeps small content at full size, centred', () => {
    expect(fitContent({ width: 300, height: 400 }, { width: 200, height: 100 })).toEqual({
      scale: 1,
      offsetX: 50,
      offsetY: 150,
    });
  });

  it('scales tall content down to fit, centred horizontally', () => {
    expect(fitContent({ width: 300, height: 300 }, { width: 200, height: 600 })).toEqual({
      scale: 0.5,
      offsetX: 100,
      offsetY: 0,
    });
  });

  it('uses the tighter of the two limits', () => {
    expect(fitContent({ width: 100, height: 300 }, { width: 400, height: 400 }).scale).toBe(0.25);
  });

  it('does not scale empty content', () => {
    expect(fitContent({ width: 100, height: 100 }, { width: 0, height: 0 }).scale).toBe(1);
  });
});

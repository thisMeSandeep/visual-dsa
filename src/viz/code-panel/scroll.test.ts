import { centredOffset } from './scroll';

const panel = { lineHeight: 24, viewportHeight: 120, contentHeight: 720 };

describe('centredOffset', () => {
  it('centres a line in the middle of the code', () => {
    expect(centredOffset({ ...panel, lineTop: 240 })).toBe(192);
  });

  it('stays at the top for the first lines', () => {
    expect(centredOffset({ ...panel, lineTop: 24 })).toBe(0);
  });

  it('never scrolls past the last line', () => {
    expect(centredOffset({ ...panel, lineTop: 696 })).toBe(600);
  });

  it('does not scroll when all the code fits', () => {
    expect(centredOffset({ ...panel, contentHeight: 96, lineTop: 72 })).toBe(0);
  });
});

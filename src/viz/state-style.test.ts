import type { ElementState } from '@/engine/core/types';
import { COLOR_TOKENS } from '@/theme';

import { STATE_PAINT, type StatePaint } from './state-style';

const STATES: ElementState[] = [
  'default',
  'active',
  'new',
  'collision',
  'swapping',
  'visited',
  'found',
  'sorted',
  'error',
  'dimmed',
];

/** Everything about a paint except colour, i.e. what a colour-blind user can still see. */
const nonColour = (paint: StatePaint) => `${paint.strokeWidth}/${paint.dashed}/${paint.dimmed}`;

describe('STATE_PAINT', () => {
  it('styles every element state with real colour tokens', () => {
    for (const state of STATES) {
      const paint = STATE_PAINT[state];
      for (const token of [paint.fill, paint.stroke, paint.text]) {
        expect(COLOR_TOKENS).toContain(token);
      }
    }
  });

  it('uses the signal colour for "look here now" states', () => {
    for (const state of ['active', 'new', 'collision', 'swapping'] as const) {
      expect(STATE_PAINT[state].stroke).toBe('signal');
    }
  });

  it('marks done states green and errors red and dashed', () => {
    expect(STATE_PAINT.found.stroke).toBe('success');
    expect(STATE_PAINT.sorted.stroke).toBe('success');
    expect(STATE_PAINT.error).toMatchObject({ stroke: 'danger', dashed: true });
  });

  it('never tells the main states apart by colour alone', () => {
    // Default, highlighted, error and dimmed must differ in border weight, dash or opacity.
    const looks = ['default', 'active', 'error', 'dimmed'].map((state) =>
      nonColour(STATE_PAINT[state as ElementState]),
    );
    expect(new Set(looks).size).toBe(looks.length);
  });
});

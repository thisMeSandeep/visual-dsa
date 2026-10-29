import { config } from '@/config';

import { parseExpression } from './expression-input';

describe('parseExpression', () => {
  it('accepts an expression, dropping spaces', () => {
    expect(parseExpression(' ( 5 + 3 ) * 2 ')).toEqual({ ok: true, expression: '(5+3)*2' });
    expect(parseExpression('[{()}]')).toEqual({ ok: true, expression: '[{()}]' });
  });

  it('explains an empty, overlong or overdeep expression', () => {
    expect(parseExpression('   ')).toEqual({
      ok: false,
      problem: 'Type an expression first, or pick a preset.',
    });
    const long = '1'.repeat(config.structures.brackets.maxLength + 1);
    expect(parseExpression(long)).toMatchObject({
      ok: false,
      problem: expect.stringMatching(/too long/),
    });
    const deep = '('.repeat(config.engine.maxItems + 1);
    expect(parseExpression(deep)).toMatchObject({
      ok: false,
      problem: expect.stringMatching(/opening brackets/),
    });
  });
});

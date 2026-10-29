import { mergeTokens, roleOf, stripLineMarkers } from './code-tokens';

describe('stripLineMarkers', () => {
  it('removes markers and records the lines each id marks', () => {
    const source = [
      'push(value) {',
      '  if (full) { // @line check-full',
      '    top = top + 1  // @line push',
      '    items[top] = value // @line push',
      '}',
      '',
    ].join('\n');

    expect(stripLineMarkers(source)).toEqual({
      code: 'push(value) {\n  if (full) {\n    top = top + 1\n    items[top] = value\n}',
      lineIds: { 'check-full': [1], push: [2, 3] },
    });
  });

  it('reads # markers too', () => {
    expect(stripLineMarkers('top -= 1  # @line pop').lineIds).toEqual({ pop: [0] });
  });

  it('leaves ordinary comments alone', () => {
    expect(stripLineMarkers('x = 1 // the line count').code).toBe('x = 1 // the line count');
  });

  it('rejects ids that are not kebab-case', () => {
    expect(() => stripLineMarkers('a\nb // @line Check_Full')).toThrow(
      'line 2: "Check_Full" is not a kebab-case line id',
    );
  });
});

describe('roleOf', () => {
  it.each([
    [['source.js', 'meta.block.js', 'keyword.control.conditional.js'], 'keyword'],
    [['source.js', 'storage.type.class.js'], 'keyword'],
    [['source.js', 'variable.language.this.js'], 'keyword'],
    [['source.js', 'keyword.operator.new.js'], 'keyword'],
    [['source.js', 'keyword.operator.comparison.js'], 'plain'],
    [['source.js', 'entity.name.function.js'], 'name'],
    [['source.js', 'entity.name.type.class.js'], 'name'],
    [['source.js', 'constant.numeric.decimal.js'], 'number'],
    [['source.js', 'string.quoted.double.js', 'punctuation.definition.string.begin.js'], 'string'],
    [['source.js', 'comment.line.double-slash.js', 'punctuation.definition.comment.js'], 'comment'],
    [['source.js', 'meta.block.js', 'variable.other.object.js'], 'plain'],
    [[], 'plain'],
  ])('%j → %s', (scopes, role) => {
    expect(roleOf(scopes)).toBe(role);
  });

  it('matches whole scope names, not prefixes of words', () => {
    expect(roleOf(['source.js', 'stringish.custom'])).toBe('plain');
  });
});

describe('mergeTokens', () => {
  it('joins neighbours with the same role and drops empty pieces', () => {
    expect(
      mergeTokens([
        ['  ', 'plain'],
        ['this', 'keyword'],
        ['.', 'plain'],
        ['items', 'plain'],
        ['', 'number'],
        ['.', 'plain'],
      ]),
    ).toEqual([
      ['  ', 'plain'],
      ['this', 'keyword'],
      ['.items.', 'plain'],
    ]);
  });
});

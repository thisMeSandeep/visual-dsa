import { ACCENTS } from '.';

// The app's TypeScript has no Node types; Jest runs in Node, so fs is there to require.
const { readFileSync } = require('fs') as {
  readFileSync: (path: string, encoding: 'utf8') => string;
};

/** tokens.css as text: Jest can't read CSS variables, so the checks read the file itself. */
const CSS = readFileSync(`${process.cwd()}/src/theme/tokens.css`, 'utf8');
const MODES = ['light', 'dark'] as const;
const ROLES = ['primary', 'on-primary', 'primary-soft', 'primary-track'] as const;

const accentValue = (accent: string, mode: string, role: string) =>
  new RegExp(`--accent-${accent}-${mode}-${role}:\\s*([^;]+);`).exec(CSS)?.[1]?.trim();

/** A `--color-*` value inside the `@variant light` or `@variant dark` block. */
function themeValue(mode: 'light' | 'dark', name: string): string | undefined {
  const start = CSS.indexOf(`@variant ${mode} {`);
  const block = CSS.slice(start, CSS.indexOf('\n    }', start));
  return new RegExp(`--color-${name}:\\s*([^;]+);`).exec(block)?.[1]?.trim();
}

/** WCAG contrast ratio of two #rrggbb colours. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(bl!);
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe('accent palettes', () => {
  it.each(ACCENTS)('%s defines all four colours in both themes', (accent) => {
    for (const mode of MODES) {
      for (const role of ROLES) expect(accentValue(accent, mode, role)).toBeDefined();
    }
  });

  it('starts from cobalt: the default accent is the primary tokens as written', () => {
    for (const mode of MODES) {
      for (const role of ROLES) {
        expect(accentValue('cobalt', mode, role)).toBe(themeValue(mode, role));
      }
    }
  });

  it.each(ACCENTS)('%s is readable as text and under its button labels (4.5:1)', (accent) => {
    for (const mode of MODES) {
      const primary = accentValue(accent, mode, 'primary')!;
      expect(contrast(primary, accentValue(accent, mode, 'on-primary')!)).toBeGreaterThanOrEqual(
        4.5,
      );
      for (const neutral of ['background', 'surface']) {
        expect(contrast(primary, themeValue(mode, neutral)!)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

/* ------------------------------------------------------------------------------------------------
 * Import boundaries (ARCHITECTURE.md §3)
 * ---------------------------------------------------------------------------------------------- */

/** Matches an import of one of our `src/` folders, via the `@/` alias or a relative `../` path. */
const srcFolder = (folders) => `^(?:@/|(?:\\.\\./)+)(?:${folders.join('|')})(?:/|$)`;

const noImportOf = (folders, message) => ({ regex: srcFolder(folders), message });

const UI_RUNTIME = [
  'react',
  'react/*',
  'react-native',
  'react-native-*',
  '@react-native/*',
  'expo',
  'expo-*',
  '@expo/*',
  '@shopify/*',
  'uniwind',
  'zustand',
];

const boundaries = [
  {
    files: ['src/engine/**'],
    patterns: [
      {
        group: UI_RUNTIME,
        message: 'src/engine is pure TypeScript: no React, React Native or Expo imports.',
      },
      noImportOf(
        ['app', 'screens', 'components', 'viz', 'content', 'stores', 'theme', 'hooks', 'utils'],
        'src/engine may only import src/config.',
      ),
    ],
  },
  {
    files: ['src/config/**', 'src/theme/**'],
    patterns: [
      {
        regex: '^(?:@/|\\.\\./)',
        message: 'src/config and src/theme are leaf modules: they import nothing from the app.',
      },
    ],
  },
  {
    files: ['src/content/**'],
    patterns: [
      noImportOf(
        ['app', 'screens', 'components', 'viz', 'stores', 'theme', 'hooks'],
        'src/content is data: it may import engine types and config, never UI.',
      ),
    ],
  },
  {
    files: ['src/stores/**'],
    patterns: [
      noImportOf(
        ['app', 'screens', 'components', 'viz', 'theme'],
        'src/stores holds state only, never UI.',
      ),
    ],
  },
  {
    files: ['src/viz/**'],
    patterns: [
      noImportOf(
        ['app', 'screens', 'content'],
        'src/viz receives scenes as props and never imports content or screens.',
      ),
    ],
  },
  {
    files: ['src/components/**'],
    patterns: [noImportOf(['app', 'screens'], 'Shared components never import routes or screens.')],
  },
  {
    files: ['src/screens/**'],
    patterns: [noImportOf(['app'], 'Screens never import route files.')],
  },
].map(({ files, patterns }) => ({
  files,
  rules: { 'no-restricted-imports': ['error', { patterns }] },
}));

/* ------------------------------------------------------------------------------------------------
 * No hard-coded values (ARCHITECTURE.md §9.3)
 * ---------------------------------------------------------------------------------------------- */

const HEX_COLOR = '/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/';
const FN_COLOR = '/(rgb|rgba|hsl|hsla)\\(/';
const ARBITRARY_CLASS = '/[a-z0-9]-\\[[^\\]]+\\]/';
/**
 * Tailwind's default palette (bg-red-500, text-white, border-black…). tokens.css can't reset it
 * without also removing our theme colours, so lint keeps it out instead.
 */
const DEFAULT_PALETTE_CLASS =
  '/(^|\\s|:)(bg|text|border(-[trblxy])?|ring|outline|fill|stroke|divide|decoration|shadow|accent|caret|placeholder|from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}(\\/[0-9]+)?($|\\s)|(^|\\s|:)(bg|text|border|fill|stroke)-(white|black)($|\\s)/';

const colorLiteralRules = [HEX_COLOR, FN_COLOR].flatMap((pattern) => [
  {
    selector: `Literal[value=${pattern}]`,
    message: 'No colour literals: add a token to src/theme/tokens.css and use it.',
  },
  {
    selector: `TemplateElement[value.raw=${pattern}]`,
    message: 'No colour literals: add a token to src/theme/tokens.css and use it.',
  },
]);

const defaultPaletteRules = [
  {
    selector: `Literal[value=${DEFAULT_PALETTE_CLASS}]`,
    message:
      'No Tailwind default colours (bg-red-500, text-white): use our tokens, e.g. bg-primary.',
  },
  {
    selector: `TemplateElement[value.raw=${DEFAULT_PALETTE_CLASS}]`,
    message:
      'No Tailwind default colours (bg-red-500, text-white): use our tokens, e.g. bg-primary.',
  },
];

const arbitraryClassRules = [
  {
    selector: `Literal[value=${ARBITRARY_CLASS}]`,
    message: 'No arbitrary Tailwind values like bg-[#fff] or p-[13px]: use a token class.',
  },
  {
    selector: `TemplateElement[value.raw=${ARBITRARY_CLASS}]`,
    message: 'No arbitrary Tailwind values like bg-[#fff] or p-[13px]: use a token class.',
  },
];

const hardCodedValues = [
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...colorLiteralRules,
        ...arbitraryClassRules,
        ...defaultPaletteRules,
      ],
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
          detectObjects: true,
        },
      ],
    },
  },
  {
    // The token files are the one place colours are written down.
    files: ['src/theme/**'],
    rules: { 'no-restricted-syntax': ['error', ...arbitraryClassRules, ...defaultPaletteRules] },
  },
  {
    // Config, tokens, lesson data, tests, test fixtures and dev showcase sample data are where
    // concrete values belong.
    files: [
      'src/config/**',
      'src/theme/**',
      'src/content/**',
      'src/screens/dev/**',
      'src/**/*.test.{ts,tsx}',
      'src/**/*.fixture.ts',
      // Line-drawing coordinates are drawing data, like glyph paths.
      'src/components/topic-art/drawings.tsx',
    ],
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
];

/** Jest mock factories and jest.isolateModules can only load modules with require(). */
const tests = {
  files: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'jest.setup.ts'],
  rules: { '@typescript-eslint/no-require-imports': 'off' },
};

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  ...boundaries,
  ...hardCodedValues,
  tests,
  {
    // Code samples are shown to learners, not run; generated tokens are build output.
    ignores: [
      'dist/*',
      '.expo/*',
      'node_modules/*',
      'src/content/topics/*/code/*',
      'src/content/generated/*',
    ],
  },
]);

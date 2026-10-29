import { Text, type TextProps } from 'react-native';

/*
 * All text in the app goes through <AppText>. A variant picks the size (from tokens.css), and the
 * default weight and tone; `weight` and `tone` override them. The class name is built from
 * complete literal strings so Uniwind can find every class at build time.
 *
 * Uniwind resolves conflicting classes by the CSS cascade, not by their order in `className`, so
 * colour and font must never be overridden through `className`. Use `tone` and `weight`.
 * `className` is for layout only (margins, flex, alignment).
 */

type Family = 'sans' | 'mono';
export type TextWeight = 'regular' | 'medium' | 'bold';

const FAMILY_CLASS: Record<Family, Record<TextWeight, string>> = {
  sans: { regular: 'font-sans', medium: 'font-sans-medium', bold: 'font-sans-bold' },
  // Mono is loaded in 400 and 500 only; bold falls back to medium.
  mono: { regular: 'font-mono', medium: 'font-mono-medium', bold: 'font-mono-medium' },
};

const TONE_CLASS = {
  ink: 'text-ink',
  'ink-2': 'text-ink-2',
  muted: 'text-muted',
  primary: 'text-primary',
  'on-primary': 'text-on-primary',
  'signal-ink': 'text-signal-ink',
  'success-ink': 'text-success-ink',
  danger: 'text-danger',
  'cat-foundations-ink': 'text-cat-foundations-ink',
  'cat-linear-ink': 'text-cat-linear-ink',
  'cat-hashing-ink': 'text-cat-hashing-ink',
  'cat-trees-ink': 'text-cat-trees-ink',
  'cat-graphs-ink': 'text-cat-graphs-ink',
  'cat-algorithms-ink': 'text-cat-algorithms-ink',
  'mode-sandbox-ink': 'text-mode-sandbox-ink',
  'mode-practice-ink': 'text-mode-practice-ink',
  'code-keyword': 'text-code-keyword',
  'code-name': 'text-code-name',
  'code-string': 'text-code-string',
  'code-number': 'text-code-number',
  'code-comment': 'text-code-comment',
} as const;

export type TextTone = keyof typeof TONE_CLASS;

type VariantSpec = { size: string; family: Family; weight: TextWeight; tone: TextTone };

/* VISUAL-SPEC §3. Sizes, line heights and letter spacing live in tokens.css (--text-*). */
const VARIANTS = {
  display: { size: 'text-display', family: 'sans', weight: 'bold', tone: 'ink' },
  title: { size: 'text-title', family: 'sans', weight: 'bold', tone: 'ink' },
  headline: { size: 'text-headline', family: 'sans', weight: 'bold', tone: 'ink' },
  caption: { size: 'text-caption', family: 'sans', weight: 'regular', tone: 'ink' },
  body: { size: 'text-body', family: 'sans', weight: 'regular', tone: 'ink' },
  'body-sm': { size: 'text-body-sm', family: 'sans', weight: 'regular', tone: 'ink-2' },
  label: { size: 'text-label', family: 'sans', weight: 'regular', tone: 'muted' },
  overline: { size: 'text-overline uppercase', family: 'sans', weight: 'medium', tone: 'muted' },
  tab: { size: 'text-tab', family: 'sans', weight: 'regular', tone: 'muted' },
  'value-xl': { size: 'text-value-xl', family: 'mono', weight: 'medium', tone: 'ink' },
  'value-lg': { size: 'text-value-lg', family: 'mono', weight: 'medium', tone: 'ink' },
  value: { size: 'text-value', family: 'mono', weight: 'medium', tone: 'ink' },
  code: { size: 'text-code', family: 'mono', weight: 'regular', tone: 'ink' },
  index: { size: 'text-index', family: 'mono', weight: 'regular', tone: 'muted' },
} as const satisfies Record<string, VariantSpec>;

export type TextVariant = keyof typeof VARIANTS;
export const TEXT_VARIANTS = Object.keys(VARIANTS) as TextVariant[];

export type AppTextOptions = {
  variant?: TextVariant;
  weight?: TextWeight;
  tone?: TextTone;
};

/** The class name for a text style: exactly one family, one size and one colour class. */
export function appTextClassName(
  { variant = 'body', weight, tone }: AppTextOptions = {},
  layoutClassName?: string,
): string {
  const spec: VariantSpec = VARIANTS[variant];
  return [
    FAMILY_CLASS[spec.family][weight ?? spec.weight],
    spec.size,
    TONE_CLASS[tone ?? spec.tone],
    layoutClassName,
  ]
    .filter(Boolean)
    .join(' ');
}

export type AppTextProps = Omit<TextProps, 'className'> &
  AppTextOptions & {
    /** Layout only (margins, flex, alignment). Use `tone` and `weight` for colour and font. */
    className?: string;
  };

export function AppText({ variant, weight, tone, className, ...props }: AppTextProps) {
  return <Text className={appTextClassName({ variant, weight, tone }, className)} {...props} />;
}

/**
 * Bold run inside another AppText ("We hash <Strong>Sid</Strong>…"). It only changes the family,
 * so it keeps the parent's size and colour.
 */
export function Strong(props: Omit<TextProps, 'className'>) {
  return <Text className="font-sans-bold" {...props} />;
}

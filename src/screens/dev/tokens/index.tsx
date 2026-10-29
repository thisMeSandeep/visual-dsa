import { ScrollView, View } from 'react-native';

import { AppText, Strong, TEXT_VARIANTS, type TextVariant } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { ICON_NAMES } from '@/components/icons';
import { TopicGlyph, type GlyphName, type TopicCategory } from '@/components/topic-glyph';
import { useColor, useVizSizes, type ColorToken } from '@/theme';

import { DevHeader } from '../dev-header';

/* Class names must be complete strings so Uniwind can find them at build time. */
const GROUPS: { title: string; swatches: { token: ColorToken; className: string }[] }[] = [
  {
    title: 'Neutrals',
    swatches: [
      { token: 'background', className: 'bg-background' },
      { token: 'surface', className: 'bg-surface' },
      { token: 'surface-raised', className: 'bg-surface-raised' },
      { token: 'line', className: 'bg-line' },
      { token: 'line-strong', className: 'bg-line-strong' },
      { token: 'line-input', className: 'bg-line-input' },
      { token: 'edge', className: 'bg-edge' },
      { token: 'ink', className: 'bg-ink' },
      { token: 'ink-2', className: 'bg-ink-2' },
      { token: 'muted', className: 'bg-muted' },
    ],
  },
  {
    title: 'Semantic',
    swatches: [
      { token: 'primary', className: 'bg-primary' },
      { token: 'on-primary', className: 'bg-on-primary' },
      { token: 'primary-soft', className: 'bg-primary-soft' },
      { token: 'primary-track', className: 'bg-primary-track' },
      { token: 'signal', className: 'bg-signal' },
      { token: 'signal-ink', className: 'bg-signal-ink' },
      { token: 'signal-soft', className: 'bg-signal-soft' },
      { token: 'success', className: 'bg-success' },
      { token: 'success-ink', className: 'bg-success-ink' },
      { token: 'success-soft', className: 'bg-success-soft' },
      { token: 'danger', className: 'bg-danger' },
      { token: 'danger-soft', className: 'bg-danger-soft' },
    ],
  },
  {
    title: 'Categories',
    swatches: [
      { token: 'cat-foundations', className: 'bg-cat-foundations' },
      { token: 'cat-linear', className: 'bg-cat-linear' },
      { token: 'cat-hashing', className: 'bg-cat-hashing' },
      { token: 'cat-trees', className: 'bg-cat-trees' },
      { token: 'cat-graphs', className: 'bg-cat-graphs' },
      { token: 'cat-algorithms', className: 'bg-cat-algorithms' },
    ],
  },
  {
    title: 'Modes',
    swatches: [
      { token: 'mode-sandbox', className: 'bg-mode-sandbox' },
      { token: 'mode-sandbox-soft', className: 'bg-mode-sandbox-soft' },
      { token: 'mode-practice', className: 'bg-mode-practice' },
      { token: 'mode-practice-soft', className: 'bg-mode-practice-soft' },
    ],
  },
];

/** Sample copy per text style, written the way the app will use it. */
const TYPE_SAMPLES: Record<TextVariant, string> = {
  display: 'Hash Table',
  title: 'Which bucket does Kat go to?',
  headline: 'Continue: Hash Table',
  caption: 'Sid also hashes to bucket 2, where Jim already is.',
  body: 'Store key–value pairs and find any of them fast.',
  'body-sm': '17 divided by 6 leaves a remainder of 5.',
  label: '4 chapters · step 6 of 70',
  overline: 'Linear structures',
  tab: 'Practice',
  'value-xl': '5',
  'value-lg': '42  0O  1lI',
  value: 'O(1)  h("Sid") = 2',
  code: 'if a[j] > a[j+1]: swap(a, j, j+1)',
  index: '0  1  2  3  4  5',
};

/** Each MVP topic's glyph in its category colour. */
const TOPIC_GLYPHS: { glyph: GlyphName; category: TopicCategory; title: string }[] = [
  { glyph: 'big-o', category: 'foundations', title: 'Big O' },
  { glyph: 'array', category: 'linear', title: 'Array' },
  { glyph: 'linked-list', category: 'linear', title: 'Linked List' },
  { glyph: 'stack', category: 'linear', title: 'Stack' },
  { glyph: 'queue', category: 'linear', title: 'Queue' },
  { glyph: 'hash-table', category: 'hashing', title: 'Hash Table' },
];

export function DevTokens() {
  const viz = useVizSizes();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-7 px-6 pt-safe-offset-4 pb-safe-offset-6"
    >
      <DevHeader title="Design tokens" />

      <View className="gap-4">
        <AppText variant="overline">Topic glyphs</AppText>
        {TOPIC_GLYPHS.map((item) => (
          <View key={item.glyph} className="flex-row items-center gap-4">
            <TopicGlyph glyph={item.glyph} category={item.category} />
            <AppText variant="body" weight="medium">
              {item.title}
            </AppText>
          </View>
        ))}
      </View>

      <View className="gap-4">
        <AppText variant="overline">Icons</AppText>
        <View className="flex-row flex-wrap gap-4">
          {ICON_NAMES.map((name) => (
            <View key={name} className="w-16 items-center gap-1">
              <Icon name={name} size="lg" />
              <AppText variant="index">{name}</AppText>
            </View>
          ))}
        </View>
        <AppText variant="label">Weights: regular · fill · duotone</AppText>
        <View className="flex-row gap-6">
          <Icon name="bookmark" size="lg" />
          <Icon name="bookmark" size="lg" weight="fill" tone="primary" />
          <Icon name="predict" size="lg" weight="duotone" tone="mode-practice" />
        </View>
        <AppText variant="label">Sizes: xs · sm · md · lg</AppText>
        <View className="flex-row items-end gap-6">
          <Icon name="play" size="xs" weight="fill" />
          <Icon name="play" size="sm" weight="fill" />
          <Icon name="play" size="md" weight="fill" />
          <Icon name="play" size="lg" weight="fill" />
        </View>
        <AppText variant="label">Tones: streak · done · tab active · tab inactive</AppText>
        <View className="flex-row gap-6">
          <Icon name="streak" size="lg" weight="fill" tone="signal" />
          <Icon name="done" size="lg" tone="success" label="Completed" />
          <Icon name="learn" size="lg" weight="fill" tone="primary" />
          <Icon name="practice" size="lg" tone="muted" />
        </View>
      </View>

      <View className="gap-4">
        <AppText variant="overline">Typography</AppText>
        {TEXT_VARIANTS.map((variant) => (
          <View key={variant} className="gap-1">
            <AppText variant="index">{variant}</AppText>
            <AppText variant={variant}>{TYPE_SAMPLES[variant]}</AppText>
          </View>
        ))}
        <AppText variant="caption">
          Two keys in one bucket is a <Strong>collision</Strong>.
        </AppText>
      </View>

      {GROUPS.map((group) => (
        <View key={group.title} className="gap-3">
          <AppText variant="overline">{group.title}</AppText>
          {group.swatches.map((swatch) => (
            <Swatch key={swatch.token} {...swatch} />
          ))}
        </View>
      ))}

      <View className="gap-1">
        <AppText variant="overline">Canvas sizes (TS-only tokens)</AppText>
        <AppText variant="body-sm">
          cell {viz.cellWidth} × {viz.cellHeight} · bucket {viz.bucketWidth} × {viz.bucketHeight}
        </AppText>
        <AppText variant="body-sm">
          gap {viz.gap} · radius {viz.radius} · edge {viz.edgeWidth} · dimmed {viz.dimmedOpacity}
        </AppText>
      </View>
    </ScrollView>
  );
}

function Swatch({ token, className }: { token: ColorToken; className: string }) {
  // Read through src/theme too, to prove TypeScript sees the same value as the class name.
  const value = useColor(token);

  return (
    <View className="flex-row items-center gap-3">
      <View className={`h-10 w-10 rounded-md border border-line ${className}`} />
      <View className="flex-1">
        <AppText variant="body-sm" tone="ink">
          {token}
        </AppText>
        <AppText variant="index">{value || 'not readable from TS'}</AppText>
      </View>
    </View>
  );
}

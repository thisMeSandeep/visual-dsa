import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText, Strong, type TextVariant } from '@/components/app-text';
import { SegmentedControl } from '@/components/segmented-control';
import { StatStrip } from '@/components/stat-strip';
import { CATEGORY_TEXT_TONE, TopicGlyph } from '@/components/topic-glyph';
import { captionSegments } from '@/content/captions';
import { getTopicMeta, isTopicId, TOPIC_REFERENCES } from '@/content/registry';
import type { Reference as ReferenceSheet } from '@/content/schema';

import { ScreenPlaceholder } from '../placeholder';

type Block = ReferenceSheet['tabs'][number]['blocks'][number];

/**
 * Reference sheet, presented as a form sheet over the lesson (F-801 – F-803): the topic in one
 * line and how it scales, then its cheat sheet in tabs (overview, complexity tables, pitfalls…).
 */
export function Reference({ topicId }: { topicId: string }) {
  const meta = getTopicMeta(topicId);
  const sheet = isTopicId(topicId) ? TOPIC_REFERENCES[topicId] : undefined;
  const [tabId, setTabId] = useState(sheet?.tabs[0]?.id);
  if (!meta) {
    return <ScreenPlaceholder sheet title="Reference" note="This topic doesn’t exist." />;
  }
  const tab = sheet?.tabs.find((item) => item.id === tabId) ?? sheet?.tabs[0];

  return (
    // On Android the form sheet is a native bottom sheet that takes every drag unless its content
    // scrolls as a nested child; without this, scrolling down drags the sheet shut instead.
    <ScrollView
      nestedScrollEnabled
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 px-6 pt-6 pb-safe-offset-6"
    >
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <TopicGlyph glyph={meta.glyph} category={meta.category} size="sm" />
          <AppText variant="overline" weight="bold" tone={CATEGORY_TEXT_TONE[meta.category]}>
            {meta.title}
          </AppText>
        </View>
        <AppText variant="title" accessibilityRole="header">
          Reference
        </AppText>
        <AppText variant="body" tone="ink-2">
          {meta.summary}
        </AppText>
      </View>
      <View className="gap-2">
        <AppText variant="overline" accessibilityRole="header">
          How it scales
        </AppText>
        <StatStrip items={meta.complexity} />
      </View>

      {sheet && tab ? (
        <View className="gap-4">
          {sheet.tabs.length > 1 ? (
            <SegmentedControl
              label="Section"
              options={sheet.tabs.map((item) => ({ value: item.id, label: item.title }))}
              value={tab.id}
              onChange={setTabId}
            />
          ) : null}
          {tab.blocks.map((block, index) => (
            <BlockView key={`${tab.id}-${index}`} block={block} />
          ))}
        </View>
      ) : (
        <AppText variant="label">This topic’s cheat sheet arrives with its lessons.</AppText>
      )}
    </ScrollView>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'heading':
      return (
        <AppText variant="overline" accessibilityRole="header">
          {block.text}
        </AppText>
      );
    case 'text':
      return <RichText text={block.text} variant="body" />;
    case 'bullets':
      return (
        <View className="gap-2">
          {block.items.map((item) => (
            <View key={item} className="flex-row gap-3">
              {/* The dot sits on the first line of the item. */}
              <View className="mt-2.5 h-1.5 w-1.5 rounded-full bg-muted" />
              <RichText text={item} variant="body" className="flex-1" />
            </View>
          ))}
        </View>
      );
    case 'table':
      return <Table columns={block.columns} rows={block.rows} />;
  }
}

/** Complexities such as O(n log n), and plain numbers, read best in mono. */
const isMono = (cell: string) => /^O\(.*\)$/.test(cell) || /^[\d.,]+$/.test(cell);

/** A table with a header row; the first column takes the spare width. */
function Table({ columns, rows }: { columns: readonly string[]; rows: readonly string[][] }) {
  const width = (column: number) => (column === 0 ? 'flex-1' : 'w-1/4');
  return (
    <View className="overflow-hidden rounded-md border-hairline border-line">
      <View className="flex-row gap-3 bg-surface px-4 py-2" accessibilityRole="header">
        {columns.map((column, index) => (
          <AppText key={column} variant="label" weight="bold" className={width(index)}>
            {column}
          </AppText>
        ))}
      </View>
      {rows.map((row) => (
        <View
          key={row.join('|')}
          accessible
          accessibilityLabel={row.map((cell, index) => `${columns[index]}: ${cell}`).join(', ')}
          className="flex-row items-center gap-3 border-t-hairline border-line px-4 py-2.5"
        >
          {row.map((cell, index) => (
            <AppText
              key={`${index}-${cell}`}
              variant={isMono(cell) ? 'code' : 'body-sm'}
              tone={index === 0 ? 'ink' : 'ink-2'}
              className={width(index)}
            >
              {cell}
            </AppText>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Text with its key terms in **bold**. */
function RichText({
  text,
  variant,
  className,
}: {
  text: string;
  variant: TextVariant;
  className?: string;
}) {
  return (
    <AppText variant={variant} tone="ink-2" className={className}>
      {captionSegments(text).map((segment, index) =>
        segment.bold ? <Strong key={index}>{segment.text}</Strong> : segment.text,
      )}
    </AppText>
  );
}

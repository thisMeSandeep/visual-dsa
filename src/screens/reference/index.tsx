import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { StatStrip } from '@/components/stat-strip';
import { CATEGORY_TEXT_TONE, TopicGlyph } from '@/components/topic-glyph';
import { getTopicMeta } from '@/content/registry';

import { ScreenPlaceholder } from '../placeholder';

/**
 * Reference sheet, presented as a form sheet over the lesson (F-801): the topic in one line and
 * how its operations scale. The full cheat sheets (tabs, tables, pitfalls) arrive in Step 9.6.
 */
export function Reference({ topicId }: { topicId: string }) {
  const meta = getTopicMeta(topicId);
  if (!meta) {
    return <ScreenPlaceholder sheet title="Reference" note="This topic doesn’t exist." />;
  }

  return (
    <ScrollView
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
      <AppText variant="label">Full cheat sheets for each topic arrive in a later step.</AppText>
    </ScrollView>
  );
}

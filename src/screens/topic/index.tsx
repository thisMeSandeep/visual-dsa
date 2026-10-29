import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { ChapterRow } from '@/components/chapter-row';
import { IconButton } from '@/components/icon-button';
import { StatStrip } from '@/components/stat-strip';
import { CATEGORY_TEXT_TONE, TopicGlyph } from '@/components/topic-glyph';
import { getTopicMeta } from '@/content/registry';
import { CATEGORY_LABELS, type TopicMeta } from '@/content/schema';
import { chapterState, completedCount, useTopicProgress } from '@/hooks/use-topic-progress';

/** Topic detail: what it is, how it scales, the three modes and the chapters (F-102). */
export function Topic({ topicId }: { topicId: string }) {
  const meta = getTopicMeta(topicId);
  return meta ? <TopicDetail meta={meta} /> : <TopicNotFound />;
}

function TopicDetail({ meta }: { meta: TopicMeta }) {
  const progress = useTopicProgress(meta.id);
  const completed = completedCount(meta, progress);
  const finished = completed === meta.chapters.length;
  const started = completed > 0 || progress.resume !== undefined;
  const topicId = meta.id;

  const openLesson = (chapter?: string) =>
    router.push({
      pathname: '/topic/[topicId]/learn',
      params: chapter ? { topicId, chapter } : { topicId },
    });

  return (
    // The safe-area padding sits outside the scroll view, so content never scrolls under the
    // status bar.
    <View className="flex-1 bg-background pt-safe">
      <ScrollView className="flex-1" contentContainerClassName="gap-7 px-6 pt-2 pb-safe-offset-6">
        <View className="-mx-3 flex-row items-center justify-between">
          <IconButton icon="back" label="Back" onPress={() => router.back()} />
          <IconButton
            icon="reference"
            label="Reference sheet"
            onPress={() =>
              router.push({ pathname: '/topic/[topicId]/reference', params: { topicId } })
            }
          />
        </View>

        <View className="gap-2.5">
          <View className="flex-row items-center gap-2">
            <TopicGlyph glyph={meta.glyph} category={meta.category} size="sm" />
            <AppText variant="overline" weight="bold" tone={CATEGORY_TEXT_TONE[meta.category]}>
              {CATEGORY_LABELS[meta.category]}
            </AppText>
          </View>
          <AppText variant="display" accessibilityRole="header">
            {meta.title}
          </AppText>
          <AppText variant="body" tone="ink-2">
            {meta.summary}
          </AppText>
        </View>

        <StatStrip items={meta.complexity} />

        <View className="gap-3">
          {/* With no chapter, the lesson resumes where the learner left off. A finished topic is
            reviewed from the start. */}
          <Button
            label={finished ? 'Review lesson' : started ? 'Continue lesson' : 'Start lesson'}
            icon="play"
            iconWeight="fill"
            onPress={() => openLesson(finished ? meta.chapters[0]?.id : undefined)}
          />
          <View className="flex-row gap-3">
            <Button
              label="Sandbox"
              variant="sandbox"
              size="compact"
              icon="random"
              className="flex-1"
              onPress={() =>
                router.push({ pathname: '/topic/[topicId]/play', params: { topicId } })
              }
            />
            <Button
              label="Practice"
              variant="practice"
              size="compact"
              icon="practice"
              className="flex-1"
              onPress={() =>
                router.push({ pathname: '/topic/[topicId]/practice', params: { topicId } })
              }
            />
          </View>
        </View>

        <View>
          <View className="flex-row items-baseline justify-between pb-1.5">
            <AppText variant="overline" accessibilityRole="header">
              Chapters
            </AppText>
            <AppText variant="index">
              {completed} of {meta.chapters.length}
            </AppText>
          </View>
          {meta.chapters.map((chapter, index) => (
            <ChapterRow
              key={chapter.id}
              number={index + 1}
              title={chapter.title}
              state={chapterState(chapter.id, progress)}
              currentLabel={
                progress.resume?.chapterId === chapter.id
                  ? `Step ${progress.resume.step} of ${progress.resume.chapterSteps}`
                  : undefined
              }
              onPress={() => openLesson(chapter.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/** Shown for an unknown topic id, e.g. from an old or mistyped link. */
function TopicNotFound() {
  return (
    <View className="flex-1 justify-center gap-6 bg-background px-6">
      <View className="gap-2">
        <AppText variant="title" accessibilityRole="header">
          Topic not found
        </AppText>
        <AppText variant="body" tone="ink-2">
          This link points to a topic that doesn’t exist. It may have been renamed.
        </AppText>
      </View>
      <Button label="Back to Learn" onPress={() => router.replace('/')} />
    </View>
  );
}

import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { ChapterRow } from '@/components/chapter-row';
import { getTopicMeta } from '@/content/registry';
import { getLesson } from '@/hooks/use-lesson';
import { useLessonNavigation } from '@/stores/lesson-navigation';

/** Chapter index, presented as a form sheet over the lesson (F-203). */
export function Chapters({ topicId, current }: { topicId: string; current?: string }) {
  const meta = getTopicMeta(topicId);
  const lesson = getLesson(topicId);
  const requestChapter = useLessonNavigation((state) => state.requestChapter);

  const jumpTo = (chapterId: string) => {
    requestChapter(topicId, chapterId);
    router.back();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 px-6 pt-7 pb-safe-offset-6"
    >
      <View className="gap-1">
        <AppText variant="overline">{meta?.title ?? topicId}</AppText>
        <AppText variant="title" accessibilityRole="header">
          Chapters
        </AppText>
      </View>

      {lesson && meta ? (
        <View>
          {lesson.chapters.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              // Numbered as on the Topic screen, so "Chapter 6" means the same thing everywhere.
              number={meta.chapters.findIndex((c) => c.id === chapter.id) + 1}
              title={chapter.title}
              state={chapter.id === current ? 'current' : 'upcoming'}
              onPress={() => jumpTo(chapter.id)}
            />
          ))}
        </View>
      ) : (
        <AppText variant="body-sm">This lesson’s chapters arrive with its lesson.</AppText>
      )}
    </ScrollView>
  );
}

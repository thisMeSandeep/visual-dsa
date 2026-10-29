import { useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { ChapterRow } from '@/components/chapter-row';
import { IconButton } from '@/components/icon-button';
import { config } from '@/config';
import type { TopicMeta } from '@/content/schema';
import type { LessonChapter } from '@/engine/lesson/types';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTopicProgress } from '@/hooks/use-topic-progress';

const { enterMs, exitMs, easing } = config.motion.panel;
const EASE_OUT = Easing.bezier(...easing);
const PANEL_IN = SlideInRight.duration(enterMs).easing(EASE_OUT);
const PANEL_OUT = SlideOutRight.duration(exitMs).easing(EASE_OUT);
const FADE_IN = FadeIn.duration(enterMs);
const FADE_OUT = FadeOut.duration(exitMs);

export type ChapterPanelProps = {
  meta: TopicMeta;
  chapters: readonly LessonChapter[];
  /** The chapter on screen now. */
  currentId: string | undefined;
  onPick: (chapter: LessonChapter) => void;
  onClose: () => void;
};

/**
 * The lesson's chapter list (F-203): a panel that slides in from the right over a scrim, so the
 * landscape lesson keeps its canvas in view behind it. Tapping the scrim, the close button or
 * Android's back button closes it. Rows show each chapter as done, current or still to come.
 */
export function ChapterPanel({ meta, chapters, currentId, onPick, onClose }: ChapterPanelProps) {
  const reducedMotion = useReducedMotion();
  const progress = useTopicProgress(meta.id);

  // Android's back button closes the panel before it leaves the lesson.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose]);

  return (
    <View className="absolute inset-0 flex-row">
      <Animated.View entering={FADE_IN} exiting={FADE_OUT} className="absolute inset-0 bg-scrim">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close chapters"
          onPress={onClose}
          className="flex-1"
        />
      </Animated.View>
      <View className="flex-1" pointerEvents="box-none" />
      <Animated.View
        entering={reducedMotion ? FADE_IN : PANEL_IN}
        exiting={reducedMotion ? FADE_OUT : PANEL_OUT}
        accessibilityViewIsModal
        className="w-2/5 border-l-hairline border-line-strong bg-surface-raised pt-safe pr-safe pb-safe"
      >
        <View className="flex-row items-center justify-between pt-3 pr-3 pl-6">
          <View>
            <AppText variant="overline">{meta.title}</AppText>
            <AppText variant="headline" accessibilityRole="header">
              Chapters
            </AppText>
          </View>
          <IconButton icon="close" label="Close chapters" onPress={onClose} />
        </View>
        <ScrollView contentContainerClassName="px-6 pt-3 pb-6">
          {chapters.map((chapter) => {
            // Numbered as in the topic, so "Chapter 6" means the same thing everywhere.
            const number = meta.chapters.findIndex((c) => c.id === chapter.id) + 1;
            return (
              <ChapterRow
                key={chapter.id}
                number={number}
                title={chapter.title}
                state={
                  chapter.id === currentId
                    ? 'current'
                    : progress.completedChapterIds.includes(chapter.id)
                      ? 'done'
                      : 'upcoming'
                }
                onPress={() => onPick(chapter)}
              />
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

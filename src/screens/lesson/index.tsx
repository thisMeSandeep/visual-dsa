import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { Scrubber } from '@/components/scrubber';
import { config, type CodeLanguage } from '@/config';
import { getCodeSample } from '@/content/code';
import { getTopicMeta } from '@/content/registry';
import type { TopicMeta } from '@/content/schema';
import { chapterAt, type CompiledLesson } from '@/engine/lesson/types';
import { nextSpeed } from '@/engine/player/machine';
import { getLesson } from '@/hooks/use-lesson';
import { useLessonNavigation } from '@/stores/lesson-navigation';
import {
  playerActions,
  useCanGoBack,
  useCanGoForward,
  useCurrentStep,
  usePlayer,
  usePlayerSpeed,
  usePlayerStatus,
  useStepIndex,
  useStepNumber,
  useTotalSteps,
} from '@/stores/use-player';
import { CodePanel } from '@/viz/code-panel';
import { SceneView } from '@/viz/scene-view';

import { ScreenPlaceholder } from '../placeholder';
import { CaptionText } from './caption-text';

const { swipe } = config.player;

/** Lesson player (F-201, F-202, F-203, F-205, F-401–F-403) with the code panel (F-501–F-506). */
export function Lesson({ topicId, chapter }: { topicId: string; chapter?: string }) {
  const meta = getTopicMeta(topicId);
  const lesson = getLesson(topicId);

  if (!meta) {
    return <ScreenPlaceholder back title="Topic not found" note="This lesson doesn’t exist." />;
  }
  if (!lesson) {
    return (
      <ScreenPlaceholder
        back
        overline={meta.title}
        title="Lesson"
        note="This lesson is written in a later step. The Stack lesson is ready to try now."
      />
    );
  }
  return <LessonPlayer meta={meta} lesson={lesson} startChapter={chapter} />;
}

function LessonPlayer({
  meta,
  lesson,
  startChapter,
}: {
  meta: TopicMeta;
  lesson: CompiledLesson;
  startChapter?: string;
}) {
  const startIndex = lesson.chapters.find((c) => c.id === startChapter)?.firstStep ?? 0;
  const player = usePlayer(lesson.steps, startIndex);
  const actions = playerActions(player);

  const step = useCurrentStep(player);
  const status = usePlayerStatus(player);
  const speed = usePlayerSpeed(player);
  const index = useStepIndex(player);
  const number = useStepNumber(player);
  const total = useTotalSteps(player);
  const canBack = useCanGoBack(player);
  const canForward = useCanGoForward(player);
  const chapter = chapterAt(lesson, index);

  // A chapter picked in the chapter sheet.
  const request = useLessonNavigation((state) => state.chapterRequest);
  useEffect(() => {
    if (!request || request.topicId !== meta.id) return;
    const target = lesson.chapters.find((c) => c.id === request.chapterId);
    if (target) playerActions(player).seek(target.firstStep);
    useLessonNavigation.getState().clearChapterRequest();
  }, [request, meta.id, lesson, player]);

  const [canvas, setCanvas] = useState({ width: 0, height: 0 });

  // Code panel: docked under the canvas in portrait, beside it in landscape (F-506).
  const [codeOpen, setCodeOpen] = useState<boolean>(config.code.panelOpenByDefault);
  const [language, setLanguage] = useState<CodeLanguage>(config.app.defaultCodeLanguage);
  const sample = getCodeSample(meta.id, language);
  const window = useWindowDimensions();
  const landscape = window.width > window.height;
  const showCode = codeOpen && sample !== undefined;

  // Swipe left for the next step, right for the previous one (a short flick is enough).
  const swipeGesture = usePanGesture({
    activeOffsetX: [-swipe.activateAfterPx, swipe.activateAfterPx],
    failOffsetY: [-swipe.activateAfterPx, swipe.activateAfterPx],
    runOnJS: true,
    onDeactivate: (event) => {
      if (event.translationX <= -swipe.commitPx || event.velocityX <= -swipe.flickVelocity) {
        actions.next();
      } else if (event.translationX >= swipe.commitPx || event.velocityX >= swipe.flickVelocity) {
        actions.prev();
      }
    },
  });

  const playing = status === 'playing';
  const ended = status === 'ended';

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center px-3">
        <IconButton icon="close" label="Close lesson" onPress={() => router.back()} />
        <View className="flex-1 items-center">
          <AppText variant="body-sm" weight="bold" tone="ink" numberOfLines={1}>
            {meta.title}
          </AppText>
          <AppText variant="label" numberOfLines={1}>
            {chapter?.title ?? ''}
          </AppText>
        </View>
        <IconButton
          icon="chapters"
          label="Chapters"
          onPress={() =>
            router.push({
              pathname: '/topic/[topicId]/chapters',
              params: { topicId: meta.id, current: chapter?.id ?? '' },
            })
          }
        />
      </View>

      <View className={landscape ? 'flex-1 flex-row gap-4 px-6' : 'flex-1 gap-3 px-6 pb-3'}>
        <GestureDetector gesture={swipeGesture}>
          <View
            className="flex-1"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setCanvas({ width, height });
            }}
          >
            {step && canvas.width > 0 && canvas.height > 0 ? (
              <SceneView
                scene={step.scene}
                width={canvas.width}
                height={canvas.height}
                speed={speed}
                accessibilityLabel={step.a11y}
              />
            ) : null}
          </View>
        </GestureDetector>
        {showCode ? (
          <CodePanel
            sample={sample}
            language={language}
            onLanguageChange={setLanguage}
            lineId={step?.codeLine}
            className={landscape ? 'w-1/2' : 'max-h-60'}
          />
        ) : null}
      </View>

      {/* Fixed minimum height (three caption lines) so the controls don't jump between steps. */}
      <View className="min-h-21 px-6">{step ? <CaptionText caption={step.caption} /> : null}</View>

      <Scrubber current={number} total={total} onSeek={actions.seek} className="px-6 pt-4" />

      <View className="flex-row items-center justify-between px-6 pt-2 pb-safe-offset-6">
        <IconButton
          label="Playback speed"
          text={`${speed}×`}
          variant="round"
          onPress={() => actions.setSpeed(nextSpeed(speed))}
        />
        <IconButton
          label="Previous step"
          icon="step-back"
          variant="step"
          disabled={!canBack}
          onPress={actions.prev}
        />
        <IconButton
          label={playing ? 'Pause' : ended ? 'Replay' : 'Play'}
          icon={playing ? 'pause' : ended ? 'reset' : 'play'}
          variant="play"
          disabled={status === 'awaiting-input'}
          onPress={playing ? actions.pause : actions.play}
        />
        <IconButton
          label="Next step"
          icon="step-forward"
          variant="step"
          disabled={!canForward}
          onPress={actions.next}
        />
        <IconButton
          label={showCode ? 'Hide code' : 'Show code'}
          icon="code"
          variant="round"
          active={showCode}
          disabled={!sample}
          onPress={() => setCodeOpen((open) => !open)}
        />
      </View>
    </View>
  );
}

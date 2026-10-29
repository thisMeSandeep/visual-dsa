import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { AppText } from '@/components/app-text';
import { CaptionText } from '@/components/caption-text';
import { IconButton } from '@/components/icon-button';
import { Scrubber } from '@/components/scrubber';
import { config } from '@/config';
import { getCodeSample } from '@/content/code';
import { getTopicMeta } from '@/content/registry';
import type { TopicMeta } from '@/content/schema';
import { isChapterEnd, positionAt, startIndex as openingIndex } from '@/engine/lesson/position';
import { chapterAt, type CompiledLesson } from '@/engine/lesson/types';
import { nextSpeed } from '@/engine/player/machine';
import { getLesson } from '@/hooks/use-lesson';
import { useLessonNavigation } from '@/stores/lesson-navigation';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
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

const { swipe } = config.player;

/** Lesson player (F-201, F-202, F-203, F-205, F-401–F-403) with the code panel (F-501–F-506). */
export type LessonProps = {
  topicId: string;
  /** Start at this chapter's first step. */
  chapter?: string;
  /** Start at this step, 1-based (`learn?step=N`). Without either, the lesson resumes. */
  step?: number;
};

export function Lesson({ topicId, chapter, step }: LessonProps) {
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
  return <LessonPlayer meta={meta} lesson={lesson} startChapter={chapter} startStep={step} />;
}

function LessonPlayer({
  meta,
  lesson,
  startChapter,
  startStep,
}: {
  meta: TopicMeta;
  lesson: CompiledLesson;
  startChapter?: string;
  startStep?: number;
}) {
  // Decided once, when the lesson opens: later saves mustn't move the player.
  const [startIndex] = useState(() =>
    openingIndex(lesson, {
      ...(startStep === undefined ? {} : { step: startStep }),
      ...(startChapter === undefined ? {} : { chapterId: startChapter }),
      ...withSaved(useProgress.getState().topics[meta.id]?.last),
    }),
  );
  // Lessons start at the learner's speed; changing it here makes it their new default (F-1103).
  const defaultSpeed = useSettings((state) => state.defaultSpeed);
  const setDefaultSpeed = useSettings((state) => state.setDefaultSpeed);
  const player = usePlayer(lesson.steps, startIndex, defaultSpeed);
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

  // Save where the learner is on every step, and complete a chapter on reaching its last step
  // (F-104, F-1001). Positions are a chapter id plus an offset, so lesson edits don't break them.
  useEffect(() => {
    const position = positionAt(lesson, index);
    if (!position) return;
    const { savePosition, completeChapter } = useProgress.getState();
    savePosition(meta.id, position);
    if (isChapterEnd(lesson, index)) completeChapter(meta.id, position.chapterId);
  }, [index, lesson, meta.id]);

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
  // The code language is remembered across lessons and app launches (F-1102).
  const language = useSettings((state) => state.codeLanguage);
  const setLanguage = useSettings((state) => state.setCodeLanguage);
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
          onPress={() => {
            const next = nextSpeed(speed);
            actions.setSpeed(next);
            setDefaultSpeed(next);
          }}
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

/** The saved position as an optional field (exactOptionalPropertyTypes-friendly). */
const withSaved = (saved: { chapterId: string; offset: number } | undefined) =>
  saved ? { saved } : {};

import { View } from 'react-native';

import { AppText } from './app-text';
import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { ProgressBar } from './progress-bar';

export type ContinueCardProps = {
  /** Topic name, e.g. "Hash Table". */
  title: string;
  /** Where the learner stopped, e.g. "Collision · step 6 of 70". */
  position: string;
  /** Lesson progress, 0–1. */
  progress: number;
  onPress?: () => void;
};

/**
 * "Continue where you left off" card on Home (F-104, VISUAL-SPEC §6). The whole card is one
 * button; the Resume pill is part of its face, not a second button.
 */
export function ContinueCard({ title, position, progress, onPress }: ContinueCardProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`Continue ${title}, ${position}`}
      accessibilityHint="Resumes the lesson where you left off"
      contentClassName="gap-5 rounded-xl bg-primary-soft p-6"
    >
      <View className="gap-1.5">
        <AppText variant="overline" weight="bold" tone="primary">
          Continue
        </AppText>
        <AppText variant="headline">{title}</AppText>
        <AppText variant="label">{position}</AppText>
      </View>
      <View className="flex-row items-center gap-4">
        <ProgressBar value={progress} track="tinted" className="flex-1" />
        <View className="h-11 flex-row items-center gap-2 rounded-full bg-primary px-5">
          <Icon name="play" size="xs" weight="fill" tone="on-primary" />
          <AppText variant="body-sm" weight="bold" tone="on-primary">
            Resume
          </AppText>
        </View>
      </View>
    </PressableScale>
  );
}

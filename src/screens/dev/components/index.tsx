import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { ChapterRow } from '@/components/chapter-row';
import { Chip } from '@/components/chip';
import { ContinueCard } from '@/components/continue-card';
import { FeedbackPanel } from '@/components/feedback-panel';
import { IconButton } from '@/components/icon-button';
import { ProgressBar, SegmentedProgress } from '@/components/progress-bar';
import { Scrubber } from '@/components/scrubber';
import { StatStrip } from '@/components/stat-strip';
import { TopicRow } from '@/components/topic-row';

import { DevHeader } from '../dev-header';

/** Every base component from VISUAL-SPEC §6 with sample data from the concept canvas. */
export function DevComponents() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-7 px-6 pt-safe-offset-4 pb-safe-offset-6"
    >
      <DevHeader title="Components" />

      <Section title="Buttons">
        <Button label="Continue lesson" icon="play" iconWeight="fill" />
        <View className="flex-row gap-3">
          <Button
            label="Sandbox"
            variant="sandbox"
            size="compact"
            icon="random"
            className="flex-1"
          />
          <Button
            label="Practice"
            variant="practice"
            size="compact"
            icon="practice"
            className="flex-1"
          />
        </View>
        <View className="flex-row gap-3">
          <Button label="Push" size="compact" className="flex-1" />
          <Button label="Pop" variant="tinted" size="compact" className="flex-1" />
          <Button label="Peek" variant="tinted" size="compact" className="flex-1" />
        </View>
        <View className="flex-row items-center gap-3">
          <Button label="Resume" size="pill" icon="play" iconWeight="fill" />
          <Button label="Disabled" size="compact" disabled />
        </View>
      </Section>

      <Section title="Icon buttons">
        <View className="flex-row items-center justify-between">
          <IconButton label="Close" icon="close" />
          <IconButton label="Chapters" icon="chapters" />
          <IconButton label="Bookmark" icon="bookmark" active iconWeight="fill" />
        </View>
        <View className="flex-row items-center justify-between">
          <IconButton label="Playback speed" text="1×" variant="round" />
          <IconButton label="Previous step" icon="step-back" variant="step" />
          <IconButton label="Play" icon="play" variant="play" />
          <IconButton label="Next step" icon="step-forward" variant="step" />
          <IconButton label="Show code" icon="code" variant="round" active />
        </View>
      </Section>

      <Section title="Chip">
        <Chip tone="signal" icon="streak" value="4" text="days" accessibilityLabel="4 day streak" />
      </Section>

      <Section title="Continue card">
        <ContinueCard title="Hash Table" position="Collision · step 6 of 70" progress={0.09} />
      </Section>

      <Section title="Progress">
        <ProgressBar value={0.4} accessibilityLabel="Lesson progress" />
        <SegmentedProgress total={8} done={3} accessibilityLabel="Question 3 of 8" />
        <Scrubber current={6} total={70} />
      </Section>

      <Section title="Stat strip">
        <StatStrip
          items={[
            { label: 'Search', value: 'O(1)' },
            { label: 'Insert', value: 'O(1)' },
            { label: 'Worst case', value: 'O(n)' },
          ]}
        />
      </Section>

      <Section title="Topic rows">
        <View>
          <TopicRow
            title="Array"
            subtitle="4 chapters"
            glyph="array"
            category="linear"
            status={{ kind: 'done' }}
          />
          <TopicRow
            title="Linked List"
            subtitle="5 chapters"
            glyph="linked-list"
            category="linear"
            status={{ kind: 'progress', done: 2, total: 5 }}
          />
          <TopicRow
            title="Hash Table"
            subtitle="10 chapters"
            glyph="hash-table"
            category="hashing"
            status={{ kind: 'progress', done: 3, total: 10, current: true }}
          />
        </View>
      </Section>

      <Section title="Chapter rows">
        <View>
          <ChapterRow number={3} title="Inserting keys" state="done" />
          <ChapterRow number={4} title="Collision" state="current" currentLabel="Step 6" />
          <ChapterRow number={5} title="Chaining" state="upcoming" />
        </View>
      </Section>

      <Section title="Feedback panel">
        <FeedbackPanel
          result="correct"
          title="Correct"
          explanation="17 divided by 6 leaves a remainder of 5, so Kat goes to bucket 5."
          actionLabel="Continue"
        />
        <FeedbackPanel
          result="incorrect"
          title="Not quite"
          explanation="h(Kat) is 17, and 17 divided by 6 leaves 5, not 2."
          actionLabel="See it in the lesson"
        />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-4">
      <AppText variant="overline">{title}</AppText>
      {children}
    </View>
  );
}

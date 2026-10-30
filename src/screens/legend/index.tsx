import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { LEGEND_GROUPS } from '@/viz/state-legend';
import { StateSwatch } from '@/viz/state-swatch';

/** The rest of the canvas's vocabulary, besides element states. */
const MARKS: readonly { title: string; meaning: string }[] = [
  {
    title: 'Pointers',
    meaning: 'An orange label and arrow, such as top, i or cur, marks a position.',
  },
  {
    title: 'Arrows',
    meaning: 'Grey arrows are links: a node’s next, a bucket’s chain. An orange one just changed.',
  },
  {
    title: 'Callouts',
    meaning: 'A note on an orange chip, such as h("Sid") = 288, shows a calculation.',
  },
  {
    title: 'Counters',
    meaning:
      'The numbers in the corner count this operation’s comparisons, reads, writes and swaps.',
  },
];

/**
 * The state legend (F-306, VISUAL-SPEC §7), a form sheet over the lesson: every state the canvas
 * uses, drawn as the canvas draws it, with what it means.
 */
export function Legend() {
  return (
    // nestedScrollEnabled: on Android the sheet would otherwise take the drag (see Reference).
    <ScrollView
      nestedScrollEnabled
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 px-6 pt-6 pb-safe-offset-6"
    >
      <AppText variant="title" accessibilityRole="header">
        Legend
      </AppText>
      <View className="gap-4">
        {LEGEND_GROUPS.map((group) => (
          <View
            key={group.title}
            accessible
            accessibilityLabel={`${group.title}: ${group.meaning}`}
            className="flex-row gap-4"
          >
            <View className="w-16 flex-row flex-wrap gap-1 pt-1">
              {group.states.map((state) => (
                <StateSwatch key={state} state={state} />
              ))}
            </View>
            <View className="flex-1 gap-0.5">
              <AppText variant="body" weight="bold">
                {group.title}
              </AppText>
              <AppText variant="body-sm">{group.meaning}</AppText>
            </View>
          </View>
        ))}
      </View>
      <View className="gap-3">
        <AppText variant="overline" accessibilityRole="header">
          Also on the canvas
        </AppText>
        {MARKS.map((mark) => (
          <AppText key={mark.title} variant="body-sm">
            <AppText variant="body-sm" weight="bold" tone="ink">
              {mark.title}.{' '}
            </AppText>
            {mark.meaning}
          </AppText>
        ))}
      </View>
    </ScrollView>
  );
}

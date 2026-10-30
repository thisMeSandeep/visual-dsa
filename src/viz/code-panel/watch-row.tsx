import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';

export type Variables = Readonly<Record<string, string>>;

/**
 * Live variables for the current step (F-503, VISUAL-SPEC §6 "Code panel"): `i = 3   top = 42`,
 * in mono, one line that scrolls sideways when long. A variable that changed on this step (or
 * just appeared) is in the signal colour, like the operation counters. The row keeps its height
 * when a step has none, so the code doesn't jump.
 */
export function WatchRow({ vars, previous }: { vars?: Variables; previous?: Variables }) {
  const names = Object.keys(vars ?? {});
  return (
    <View
      accessible
      accessibilityLabel={
        names.length === 0
          ? 'No variables at this step'
          : `Variables: ${names.map((name) => `${name} is ${vars![name]}`).join(', ')}`
      }
      className="min-h-6 justify-center border-b-hairline border-line px-4"
    >
      {names.length === 0 ? (
        <AppText variant="index" tone="muted">
          –
        </AppText>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-4">
            {names.map((name) => (
              <AppText
                key={name}
                variant="index"
                tone={previous?.[name] === vars![name] ? 'ink-2' : 'signal-ink'}
              >
                {`${name} = ${vars![name]}`}
              </AppText>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

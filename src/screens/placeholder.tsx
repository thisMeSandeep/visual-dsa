import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { TAB_BAR_CLEARANCE } from '@/components/floating-tab-bar';
import { IconButton } from '@/components/icon-button';

export type ScreenPlaceholderProps = {
  title: string;
  /** Small label above the title, e.g. the topic id. */
  overline?: string;
  /** Which plan step builds the real screen. */
  note: string;
  /** Show a back button (pushed screens). */
  back?: boolean;
  /** Presented as a form sheet: no top safe-area padding. */
  sheet?: boolean;
  /** Links to the routes this screen will lead to. */
  children?: ReactNode;
};

/**
 * Temporary body for routes whose real screens come in later steps. It shows where you are and
 * links onward, so the whole route map can be walked through in Expo Go.
 */
export function ScreenPlaceholder({
  title,
  overline,
  note,
  back = false,
  sheet = false,
  children,
}: ScreenPlaceholderProps) {
  return (
    // On a full screen the safe-area padding sits outside the scroll view, so content never
    // scrolls under the status bar. A sheet starts below it already.
    <View className={`flex-1 bg-background ${sheet ? '' : 'pt-safe'}`}>
      <ScrollView
        className="flex-1"
        // Tab screens use this too, so content always clears the floating tab bar.
        contentContainerClassName={`gap-7 px-6 ${TAB_BAR_CLEARANCE} ${sheet ? 'pt-6' : 'pt-4'}`}
      >
        {back ? (
          <IconButton icon="back" label="Back" onPress={() => router.back()} className="-ml-3" />
        ) : null}
        <View className="gap-2">
          {overline ? <AppText variant="overline">{overline}</AppText> : null}
          <AppText variant="display" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="body-sm">{note}</AppText>
        </View>
        {children ? <View className="gap-3">{children}</View> : null}
      </ScrollView>
    </View>
  );
}

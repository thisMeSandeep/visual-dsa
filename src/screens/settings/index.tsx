import { Host, Picker, Switch } from '@expo/ui';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { TAB_BAR_CLEARANCE } from '@/components/floating-tab-bar';
import { config } from '@/config';
import { useSettings, type ReducedMotionChoice, type ThemeChoice } from '@/stores/settings';
import { useActiveTheme, useColor } from '@/theme';
import { CODE_LANGUAGE_LABELS } from '@/viz/code-panel';

const THEME_LABELS: Record<ThemeChoice, string> = {
  system: 'Match device',
  light: 'Light',
  dark: 'Dark',
};

const REDUCED_MOTION_LABELS: Record<ReducedMotionChoice, string> = {
  system: 'Match device',
  on: 'On',
  off: 'Off',
};

/**
 * Settings tab (F-1101–F-1104, F-1107). Rows are the app's own design; the controls are native
 * @expo/ui pickers and switches, tinted cobalt and following the app's theme. Every change is
 * saved on the device at once (stores/settings.ts).
 */
export function Settings() {
  const settings = useSettings();

  return (
    // The safe-area padding sits outside the scroll view, so content never scrolls under the
    // status bar.
    <View className="flex-1 bg-background pt-safe">
      <ScrollView
        className="flex-1"
        contentContainerClassName={`gap-7 px-6 pt-4 ${TAB_BAR_CLEARANCE}`}
      >
        <AppText variant="display" accessibilityRole="header">
          Settings
        </AppText>

        <Section title="Appearance">
          <Row label="Theme" last>
            <Picker
              testID="setting-theme"
              selectedValue={settings.theme}
              onValueChange={settings.setTheme}
            >
              {Object.entries(THEME_LABELS).map(([value, label]) => (
                <Picker.Item key={value} value={value as ThemeChoice} label={label} />
              ))}
            </Picker>
          </Row>
        </Section>

        <Section title="Lessons">
          <Row label="Code language" detail="The code panel opens in this language">
            <Picker
              testID="setting-code-language"
              selectedValue={settings.codeLanguage}
              onValueChange={settings.setCodeLanguage}
            >
              {config.app.codeLanguages.map((language) => (
                <Picker.Item
                  key={language}
                  value={language}
                  label={CODE_LANGUAGE_LABELS[language]}
                />
              ))}
            </Picker>
          </Row>
          <Row label="Playback speed" detail="Lessons start at this speed" last>
            <Picker
              testID="setting-speed"
              selectedValue={settings.defaultSpeed}
              onValueChange={settings.setDefaultSpeed}
            >
              {config.player.speeds.map((speed) => (
                <Picker.Item key={speed} value={speed} label={`${speed}×`} />
              ))}
            </Picker>
          </Row>
        </Section>

        <Section title="Motion and feel">
          <Row
            label="Reduce motion"
            detail="Fade between steps instead of moving"
            last={!config.features.haptics}
          >
            <Picker
              testID="setting-reduced-motion"
              selectedValue={settings.reducedMotion}
              onValueChange={settings.setReducedMotion}
            >
              {Object.entries(REDUCED_MOTION_LABELS).map(([value, label]) => (
                <Picker.Item key={value} value={value as ReducedMotionChoice} label={label} />
              ))}
            </Picker>
          </Row>
          {config.features.haptics ? (
            <Row label="Haptics" detail="A light tap when you press a button" last>
              <Switch
                testID="setting-haptics"
                value={settings.haptics}
                onValueChange={settings.setHaptics}
              />
            </Row>
          ) : null}
        </Section>

        <AppText variant="label">Settings and progress are saved on this device only.</AppText>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <AppText variant="overline" accessibilityRole="header">
        {title}
      </AppText>
      <View className="overflow-hidden rounded-xl bg-surface">{children}</View>
    </View>
  );
}

/** A label on the left and a native control on the right. */
function Row({
  label,
  detail,
  last = false,
  children,
}: {
  label: string;
  detail?: string;
  /** The last row in its section has no divider below it. */
  last?: boolean;
  children: ReactNode;
}) {
  const theme = useActiveTheme();
  const primary = useColor('primary');

  return (
    <View
      className={`min-h-14 flex-row items-center gap-4 px-4 py-3 ${last ? '' : 'border-b border-line'}`}
    >
      <View className="flex-1 gap-0.5">
        <AppText variant="body">{label}</AppText>
        {detail ? <AppText variant="label">{detail}</AppText> : null}
      </View>
      {/* Native controls follow the app's theme (which may differ from the device's). */}
      <Host matchContents colorScheme={theme} seedColor={primary}>
        {children}
      </Host>
    </View>
  );
}

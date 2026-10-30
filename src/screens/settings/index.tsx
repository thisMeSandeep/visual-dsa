import { Host, Switch } from '@expo/ui';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { TAB_BAR_CLEARANCE } from '@/components/floating-tab-bar';
import { SegmentedControl, type SegmentOption } from '@/components/segmented-control';
import { config, type CodeLanguage } from '@/config';
import { useSettings, type ReducedMotionChoice, type ThemeChoice } from '@/stores/settings';
import { useActiveTheme, useColor } from '@/theme';
import { CODE_LANGUAGE_LABELS, CODE_LANGUAGE_SHORT_LABELS } from '@/viz/code-panel';

import { ACCENT_LABELS, AccentPicker } from './accent-picker';

const THEME_OPTIONS: readonly SegmentOption<ThemeChoice>[] = [
  { value: 'system', label: 'Device', icon: 'theme-system' },
  { value: 'light', label: 'Light', icon: 'theme-light' },
  { value: 'dark', label: 'Dark', icon: 'theme-dark' },
];

const LANGUAGE_OPTIONS: readonly SegmentOption<CodeLanguage>[] = config.app.codeLanguages.map(
  (language) => ({
    value: language,
    label: CODE_LANGUAGE_SHORT_LABELS[language],
    accessibilityLabel: CODE_LANGUAGE_LABELS[language],
  }),
);

const SPEED_OPTIONS: readonly SegmentOption<number>[] = config.player.speeds.map((speed) => ({
  value: speed,
  label: `${speed}×`,
}));

const REDUCED_MOTION_OPTIONS: readonly SegmentOption<ReducedMotionChoice>[] = [
  { value: 'system', label: 'Device' },
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
];

/**
 * Settings tab (F-1101–F-1104, F-1107). Grouped cards in the app's own style: choices are
 * segmented controls (and swatches for the accent), so every option is visible at once; on/off
 * settings are native @expo/ui switches, tinted with the accent and following the app's theme. Every change is saved on the device at
 * once (stores/settings.ts).
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
        <View className="gap-1">
          <AppText variant="display" accessibilityRole="header">
            Settings
          </AppText>
          <AppText variant="body-sm">Saved on this device as you change them.</AppText>
        </View>

        <Section title="Appearance">
          <ChoiceRow label="Theme" detail="Device follows your phone’s light or dark mode">
            <SegmentedControl
              label="Theme"
              options={THEME_OPTIONS}
              value={settings.theme}
              onChange={settings.setTheme}
            />
          </ChoiceRow>
          <ChoiceRow
            label="Accent"
            detail={`${ACCENT_LABELS[settings.accent]}: buttons, tabs and links`}
            last
          >
            <AccentPicker value={settings.accent} onChange={settings.setAccent} />
          </ChoiceRow>
        </Section>

        <Section title="Lessons">
          <ChoiceRow label="Code language" detail="The code panel opens in this language">
            <SegmentedControl
              label="Code language"
              options={LANGUAGE_OPTIONS}
              value={settings.codeLanguage}
              onChange={settings.setCodeLanguage}
            />
          </ChoiceRow>
          <ChoiceRow label="Playback speed" detail="Lessons start at this speed">
            <SegmentedControl
              label="Playback speed"
              options={SPEED_OPTIONS}
              value={settings.defaultSpeed}
              onChange={settings.setDefaultSpeed}
            />
          </ChoiceRow>
          <SwitchRow
            label="Progress bar"
            detail="Show the scrubber under the canvas"
            value={settings.showScrubber}
            onChange={settings.setShowScrubber}
            testID="setting-progress-bar"
            last
          />
        </Section>

        <Section title="Motion and feel">
          <ChoiceRow
            label="Reduce motion"
            detail="Fade between steps instead of moving"
            last={!config.features.haptics}
          >
            <SegmentedControl
              label="Reduce motion"
              options={REDUCED_MOTION_OPTIONS}
              value={settings.reducedMotion}
              onChange={settings.setReducedMotion}
            />
          </ChoiceRow>
          {config.features.haptics ? (
            <SwitchRow
              label="Haptics"
              detail="Taps for presses, swaps, matches and errors"
              value={settings.haptics}
              onChange={settings.setHaptics}
              testID="setting-haptics"
              last
            />
          ) : null}
        </Section>
      </ScrollView>
    </View>
  );
}

/** A titled card of rows, divided by hairlines. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <AppText variant="overline" accessibilityRole="header">
        {title}
      </AppText>
      <View className="overflow-hidden rounded-xl border-hairline border-line-strong bg-surface-raised">
        {children}
      </View>
    </View>
  );
}

/** Rows divide themselves with a hairline; the last in a card leaves it off. */
const rowDivider = (last: boolean) => (last ? '' : 'border-b-hairline border-line');

function RowText({ label, detail }: { label: string; detail: string }) {
  return (
    <View className="gap-0.5">
      <AppText variant="body" weight="medium">
        {label}
      </AppText>
      <AppText variant="label">{detail}</AppText>
    </View>
  );
}

/** A setting with a few choices: its name and a hint, with the choices underneath. */
function ChoiceRow({
  label,
  detail,
  last = false,
  children,
}: {
  label: string;
  detail: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <View className={`gap-3 px-4 py-4 ${rowDivider(last)}`}>
      <RowText label={label} detail={detail} />
      {children}
    </View>
  );
}

/** An on/off setting: its name and a hint, with a native switch on the right. */
function SwitchRow({
  label,
  detail,
  value,
  onChange,
  testID,
  last = false,
}: {
  label: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => void;
  testID: string;
  last?: boolean;
}) {
  const theme = useActiveTheme();
  const primary = useColor('primary');

  return (
    <View className={`flex-row items-center gap-4 px-4 py-4 ${rowDivider(last)}`}>
      <View className="flex-1">
        <RowText label={label} detail={detail} />
      </View>
      {/* Native controls follow the app's theme (which may differ from the device's). */}
      <Host matchContents colorScheme={theme} seedColor={primary}>
        <Switch testID={testID} value={value} onValueChange={onChange} />
      </Host>
    </View>
  );
}

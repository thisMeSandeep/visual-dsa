/**
 * Settings (F-1101–F-1104, F-1107), saved on the device (ARCHITECTURE §7). Saved values are
 * checked when they're read back: a missing or invalid value falls back to its default, so an
 * old or damaged save never breaks the app.
 */
import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { config, type CodeLanguage } from '@/config';

import { kvStorage } from './storage';

/** Theme choice. Matches src/theme's ThemePreference; the root layout applies it. */
export const THEME_CHOICES = ['system', 'light', 'dark'] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

/** Accent colour for actions (buttons, tabs, links). Matches src/theme's ACCENTS. */
export const ACCENT_CHOICES = ['cobalt', 'violet', 'plum', 'ocean', 'graphite'] as const;
export type AccentChoice = (typeof ACCENT_CHOICES)[number];

/** Reduced motion: follow the device setting, or force it on or off. */
export const REDUCED_MOTION_CHOICES = ['system', 'on', 'off'] as const;
export type ReducedMotionChoice = (typeof REDUCED_MOTION_CHOICES)[number];

export type SettingsValues = {
  theme: ThemeChoice;
  accent: AccentChoice;
  /** The language the code panel opens in. Switching language in the panel changes it too. */
  codeLanguage: CodeLanguage;
  /** The speed lessons start at. Changing speed in a lesson changes it too. */
  defaultSpeed: number;
  /** Haptic feedback, when the haptics feature is on (config.features.haptics). */
  haptics: boolean;
  /** The lesson's scrubber (progress bar). Hiding it gives the canvas more room. */
  showScrubber: boolean;
  reducedMotion: ReducedMotionChoice;
};

export const DEFAULT_SETTINGS: SettingsValues = {
  theme: 'system',
  accent: 'cobalt',
  codeLanguage: config.app.defaultCodeLanguage,
  defaultSpeed: config.player.defaultSpeed,
  haptics: true,
  showScrubber: true,
  reducedMotion: 'system',
};

const isOfferedSpeed = (speed: number) =>
  (config.player.speeds as readonly number[]).includes(speed);

const SettingsSchema = z
  .object({
    theme: z.enum(THEME_CHOICES).catch(DEFAULT_SETTINGS.theme),
    accent: z.enum(ACCENT_CHOICES).catch(DEFAULT_SETTINGS.accent),
    codeLanguage: z.enum(config.app.codeLanguages).catch(DEFAULT_SETTINGS.codeLanguage),
    defaultSpeed: z.number().refine(isOfferedSpeed).catch(DEFAULT_SETTINGS.defaultSpeed),
    haptics: z.boolean().catch(DEFAULT_SETTINGS.haptics),
    showScrubber: z.boolean().catch(DEFAULT_SETTINGS.showScrubber),
    reducedMotion: z.enum(REDUCED_MOTION_CHOICES).catch(DEFAULT_SETTINGS.reducedMotion),
  })
  .catch(DEFAULT_SETTINGS);

/** Saved settings as the app can use them: every field valid, defaults where needed. */
export function parseSettings(saved: unknown): SettingsValues {
  return SettingsSchema.parse(saved ?? {});
}

export type SettingsState = SettingsValues & {
  setTheme: (theme: ThemeChoice) => void;
  setAccent: (accent: AccentChoice) => void;
  setCodeLanguage: (language: CodeLanguage) => void;
  setDefaultSpeed: (speed: number) => void;
  setHaptics: (on: boolean) => void;
  setShowScrubber: (show: boolean) => void;
  setReducedMotion: (choice: ReducedMotionChoice) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setCodeLanguage: (codeLanguage) => set({ codeLanguage }),
      setDefaultSpeed: (defaultSpeed) => set({ defaultSpeed }),
      setHaptics: (haptics) => set({ haptics }),
      setShowScrubber: (showScrubber) => set({ showScrubber }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    }),
    {
      name: config.storage.keys.settings,
      version: config.storage.versions.settings,
      storage: kvStorage,
      partialize: ({
        theme,
        accent,
        codeLanguage,
        defaultSpeed,
        haptics,
        showScrubber,
        reducedMotion,
      }) => ({
        theme,
        accent,
        codeLanguage,
        defaultSpeed,
        haptics,
        showScrubber,
        reducedMotion,
      }),
      // Version 1 is the first; later versions convert older saves here before they're checked.
      migrate: (saved) => parseSettings(saved),
      merge: (saved, current) => ({ ...current, ...parseSettings(saved) }),
    },
  ),
);

/**
 * The app's fonts: the ONLY file that names a typeface. To change fonts, install the
 * `@expo-google-fonts/*` packages and change the five imports below; nothing else refers to a
 * font by name.
 *
 * Fonts are registered under role names (the keys), loaded at runtime with useFonts (works in
 * Expo Go; no config plugin). The `--font-*` tokens in ./tokens.css and the Skia canvas use these
 * role names, so they never change when the font does. React Native needs one family per weight,
 * so each weight is its own entry, imported per file so only these five are bundled.
 */
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';

export const FONT_FILES = {
  /** UI text (VISUAL-SPEC §3): Manrope. */
  'app-sans': Manrope_400Regular,
  'app-sans-medium': Manrope_500Medium,
  'app-sans-bold': Manrope_700Bold,
  /** Values, indices, pointers, code and counters: JetBrains Mono. */
  'app-mono': JetBrainsMono_400Regular,
  'app-mono-medium': JetBrainsMono_500Medium,
};

export type FontRole = keyof typeof FONT_FILES;

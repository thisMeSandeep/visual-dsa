/** Feature flags. Turn a feature on here; code checks `config.features.*`. */
export const features = {
  /** Predict-the-next-step questions (F-702, P1). */
  predictTheNextStep: false,
  /** Side-by-side compare and race modes (F-901, F-904, P1). */
  compareMode: false,
  /** Haptic feedback on key events (F-307, P1): presses, and canvas events (config/haptics.ts). */
  haptics: true,
  /** Caption narration with text-to-speech (F-210, P2). */
  narration: false,
} as const;

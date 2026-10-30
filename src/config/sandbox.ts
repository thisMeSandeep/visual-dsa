/** Sandbox / Play mode (F-601–F-606). */
export const sandbox = {
  /** How many changes Undo can step back through. */
  historyDepth: 50,
  /** Most operation buttons in a row; a tool with more splits them into even rows. */
  buttonsPerRow: 3,
  /** A slider runs its operation once it has been still this long, not on every change. */
  sliderSettleMs: 250,
  /** Positions along a slider: enough for smooth dragging, few enough to land on small values. */
  sliderPositions: 120,
} as const;

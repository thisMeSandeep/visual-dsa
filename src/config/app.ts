/** App-wide settings that aren't tied to one feature. */
export const app = {
  /** Code languages offered in the code panel (F-502). P1 adds python, java, cpp. */
  codeLanguages: ['pseudocode', 'javascript'],
  defaultCodeLanguage: 'pseudocode',
  /**
   * One-line labels (buttons, segmented controls) shrink to fit their space rather than wrap or
   * cut off, down to this fraction of their size.
   */
  minimumLabelScale: 0.75,
} as const;

export type CodeLanguage = (typeof app.codeLanguages)[number];

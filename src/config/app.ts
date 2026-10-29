/** App-wide settings that aren't tied to one feature. */
export const app = {
  /** Code languages offered in the code panel (F-502). P1 adds python, java, cpp. */
  codeLanguages: ['pseudocode', 'javascript'],
  defaultCodeLanguage: 'pseudocode',
} as const;

export type CodeLanguage = (typeof app.codeLanguages)[number];

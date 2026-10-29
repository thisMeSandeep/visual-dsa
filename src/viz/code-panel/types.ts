/**
 * What the code panel draws. Content produces these (content/code-types.ts); viz can't import
 * content, so the shape is declared again here and TypeScript checks the two match where the
 * lesson screen passes one to the other.
 */
export type CodeRole = 'plain' | 'keyword' | 'name' | 'string' | 'number' | 'comment';

export type CodePanelSample = {
  /** The code as plain text, for copying. */
  source: string;
  /** One list of [text, role] runs per line. */
  lines: readonly (readonly (readonly [string, CodeRole])[])[];
  /** Line id → the 0-based lines it highlights. */
  lineIds: Readonly<Record<string, readonly number[]>>;
};

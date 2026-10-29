/**
 * The pure parts of `scripts/highlight-code.ts`: reading `@line` markers, turning Shiki's
 * TextMate scopes into the few roles the code panel colours, and the pseudocode grammar.
 */
import type { CodeRole, CodeToken } from '@/content/code-types';

/* Line markers ---------------------------------------------------------------------------------- */

/** A trailing `// @line check-full` (or `# @line …` for languages with # comments). */
const MARKER = /\s*(?:\/\/|#)\s*@line\s+(\S+)\s*$/;
const LINE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Removes the `@line` markers and records which lines each id marks. The same id may mark
 * several lines, which then highlight together.
 */
export function stripLineMarkers(source: string): {
  code: string;
  lineIds: Record<string, number[]>;
} {
  const lineIds: Record<string, number[]> = {};
  const lines = source
    .trimEnd()
    .split('\n')
    .map((line, index) => {
      const match = MARKER.exec(line);
      if (!match) return line.trimEnd();
      const id = match[1] ?? '';
      if (!LINE_ID.test(id)) {
        throw new Error(`line ${index + 1}: "${id}" is not a kebab-case line id`);
      }
      (lineIds[id] ??= []).push(index);
      return line.slice(0, match.index).trimEnd();
    });
  return { code: lines.join('\n'), lineIds };
}

/* Roles ----------------------------------------------------------------------------------------- */

/** Scope prefix → role, most specific first. `keyword.operator` (=, +, ===) stays plain. */
const ROLE_RULES: readonly (readonly [prefix: string, role: CodeRole])[] = [
  ['comment', 'comment'],
  ['string', 'string'],
  ['constant.numeric', 'number'],
  ['constant.language', 'keyword'],
  ['variable.language', 'keyword'],
  ['keyword.operator.new', 'keyword'],
  ['keyword.operator.expression', 'keyword'],
  ['keyword.operator', 'plain'],
  ['keyword', 'keyword'],
  ['storage', 'keyword'],
  ['entity.name', 'name'],
  ['support.function', 'name'],
  ['support.class', 'name'],
];

const hasPrefix = (scope: string, prefix: string) =>
  scope === prefix || scope.startsWith(`${prefix}.`);

/**
 * The role of a token from its scopes, outermost first (as Shiki lists them). The innermost
 * scope with a rule wins, so the quote marks of a string are part of the string.
 */
export function roleOf(scopes: readonly string[]): CodeRole {
  for (const scope of [...scopes].reverse()) {
    const rule = ROLE_RULES.find(([prefix]) => hasPrefix(scope, prefix));
    if (rule) return rule[1];
  }
  return 'plain';
}

/** Joins neighbouring pieces with the same role, so each line has as few spans as possible. */
export function mergeTokens(pieces: readonly CodeToken[]): CodeToken[] {
  const merged: [string, CodeRole][] = [];
  for (const [text, role] of pieces) {
    const last = merged.at(-1);
    if (last && last[1] === role) last[0] += text;
    else if (text.length > 0) merged.push([text, role]);
  }
  return merged;
}

/* Pseudocode ------------------------------------------------------------------------------------ */

/** A small TextMate grammar for the app's pseudocode (Shiki has none built in). */
export const PSEUDOCODE_GRAMMAR = {
  name: 'pseudocode',
  scopeName: 'source.pseudocode',
  patterns: [
    { name: 'comment.line.double-slash.pseudocode', match: '//.*$' },
    { name: 'string.quoted.double.pseudocode', match: '"[^"]*"' },
    { name: 'constant.numeric.pseudocode', match: '\\b\\d+(?:\\.\\d+)?\\b' },
    { name: 'constant.language.pseudocode', match: '\\b(?:true|false|null)\\b' },
    {
      name: 'keyword.control.pseudocode',
      match:
        '\\b(?:function|end|if|then|else|while|for|each|in|do|repeat|until|return|error|is|not|and|or|to|break|continue)\\b',
    },
    { name: 'entity.name.function.pseudocode', match: '\\b[A-Za-z_]\\w*(?=\\()' },
  ],
  repository: {},
};

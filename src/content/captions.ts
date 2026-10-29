/**
 * What the learner reads for each engine caption key. Templates use {param} placeholders and
 * **bold** for the key terms (VISUAL-SPEC §3: bold only key terms, never whole sentences).
 * Lessons can also write their own text captions, which are used as they are.
 */
import type { Caption } from '@/engine/core/types';

export const CAPTIONS: Readonly<Record<string, string>> = {
  // Stack (engine/structures/stack/operations.ts)
  'stack.push.check': 'Push **{value}**. First, check there’s room on the stack.',
  'stack.pushed': '**{value}** goes on top. It’s the new **top**.',
  'stack.overflow':
    'The stack is full ({capacity} items), so **{value}** doesn’t fit. That’s an **overflow**.',
  'stack.pop.check': 'Pop. First, check the stack isn’t empty.',
  'stack.pop.read': 'The **top** item is **{value}**.',
  'stack.popped': '**{value}** comes off the top and is returned.',
  'stack.underflow': 'The stack is empty, so there’s nothing to pop. That’s an **underflow**.',
  'stack.peeked': 'Peek shows the **top** item, **{value}**, without removing it.',
  'stack.empty': 'The stack is empty, so there’s no top to peek at.',
  'stack.clear.start': 'Clear removes all {count} items at once.',
  'stack.cleared': 'The stack is empty again.',
  'stack.already-empty': 'The stack is already empty.',

  // Engine (engine/core)
  'engine.step-limit': 'This run is too long to show step by step. Try a smaller input.',
  'engine.too-many-items': 'That’s {count} items. The most that fits is {limit}.',
  'engine.value-out-of-range': '{value} is outside the range {min}–{max}.',
  'engine.not-a-whole-number': '{value} isn’t a whole number.',
};

/** The text to show for a caption, with params filled in. Unknown keys show the key itself. */
export function captionText(caption: Caption): string {
  if ('text' in caption) return caption.text;
  const template = CAPTIONS[caption.key];
  if (template === undefined) return caption.key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = caption.params?.[name];
    return value === undefined ? match : String(value);
  });
}

export type CaptionSegment = { text: string; bold: boolean };

/** Splits "**Sid** also hashes…" into plain and bold runs. */
export function captionSegments(text: string): CaptionSegment[] {
  return text
    .split('**')
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}

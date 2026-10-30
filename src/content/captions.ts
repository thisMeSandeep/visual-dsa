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

  // Array (engine/structures/array/operations.ts)
  'array.get.check': 'Get index {index}. First, check it’s less than the size, {size}.',
  'array.got':
    'Index {index} holds **{value}**. One step, wherever it is: its address is start + {index} × slot size.',
  'array.set.check':
    'Set index {index} to **{value}**. First, check it’s less than the size, {size}.',
  'array.set': '**{old}** at index {index} is overwritten with **{value}**. Also one step.',
  'array.out-of-bounds':
    'Index {index} is **out of bounds**: there are {size} items, so the indices are 0 to {last}.',
  'array.out-of-bounds.empty':
    'The array is empty, so there’s no index {index}: **out of bounds**.',
  'array.push.check': 'Push **{value}** onto the end. First, check there’s a free slot.',
  'array.pushed': '**{value}** goes in slot {index}, the first free one. Nothing has to move.',
  'array.grow': 'All {from} slots are full. Make a new array twice the size: {to} slots.',
  'array.grow.limit':
    'All {from} slots are full. Make a new array of {to} slots, the most this app draws.',
  'array.copy': 'Copy **{value}** into slot {index} of the new array.',
  'array.grown':
    'The old array is let go. Copying took one step per item, {count} in all: **O(n)**, but only now and then.',
  'array.limit':
    'All {capacity} slots are full, and {capacity} is the most this app draws, so **{value}** can’t be added.',
  'array.insert.check':
    'Insert **{value}** at index {index}. First, check the index is from 0 to the size, {size}.',
  'array.insert.out-of-bounds':
    'Index {index} would leave a gap: with {size} items you can insert at 0 to {size}. **Out of bounds**.',
  'array.shift-right': 'Move **{value}** right, from index {from} to {to}, to make room.',
  'array.inserted':
    '**{value}** goes in at index {index}, after shifting {shifted} along. Inserting is **O(n)**.',
  'array.inserted.end': '**{value}** goes in at index {index}, the end. Nothing had to move.',
  'array.remove.check': 'Remove index {index}. First, check it’s less than the size, {size}.',
  'array.remove.read': 'Index {index} holds **{value}**. Take it out.',
  'array.removed': '**{value}** is gone, leaving a gap at index {index}.',
  'array.removed.end': '**{value}** was the last item, so nothing has to move.',
  'array.shift-left': 'Move **{value}** left, from index {from} to {to}, to close the gap.',
  'array.remove.done': 'The gap is closed after shifting {shifted} along. Removing is **O(n)**.',
  'array.search.compare': 'Index {index}: is **{item}** equal to **{value}**? No, move on.',
  'array.found': 'Index {index} holds **{value}**. Found it, so the search stops here.',
  'array.not-found':
    '**{value}** isn’t here: all {size} items were checked. That’s the worst case, **O(n)**.',
  'array.search.empty': 'The array is empty, so **{value}** isn’t in it.',
  'array.visit': 'Index {index}: visit **{value}**.',
  'array.traversed': 'All {size} items visited once, front to back. Traversal is **O(n)**.',
  'array.traverse.empty': 'The array is empty: nothing to visit.',

  // Queue (engine/structures/queue/operations.ts)
  'queue.enqueue.check': 'Enqueue **{value}**. First, check there’s a free slot.',
  'queue.enqueued': '**{value}** joins at the **rear**.',
  'queue.enqueued.wrap':
    '**{value}** goes in slot {slot}: the **rear** wrapped round to the start.',
  'queue.full':
    'All {capacity} slots are taken, so **{value}** can’t join. That’s an **overflow**.',
  'queue.full.wasted':
    'The rear has hit the last slot, so **{value}** can’t join, though {free} slots at the start are free.',
  'queue.dequeue.check': 'Dequeue. First, check the queue isn’t empty.',
  'queue.dequeue.read': 'The **front** item is **{value}**.',
  'queue.dequeued': '**{value}** leaves from the front. The next item is the new **front**.',
  'queue.underflow': 'The queue is empty, so there’s nothing to dequeue. That’s an **underflow**.',
  'queue.front': 'Front shows **{value}**, the next to leave, without removing it.',
  'queue.empty': 'The queue is empty, so there’s no front to show.',
  'queue.clear.start': 'Clear removes all {count} items at once.',
  'queue.cleared': 'The queue is empty again.',
  'queue.already-empty': 'The queue is already empty.',

  // Bracket checker (engine/structures/stack/brackets.ts)
  'brackets.start': 'Read **{expression}** left to right. Opening brackets wait on the stack.',
  'brackets.open': '**{bracket}** opens a group, so push it.',
  'brackets.match': '**{bracket}** closes the **{open}** on top. They match.',
  'brackets.popped': 'Pop **{open}**: that pair is done.',
  'brackets.unmatched': '**{bracket}** has nothing to close: the stack is empty. **Unbalanced**.',
  'brackets.mismatch': '**{bracket}** can’t close the **{open}** on top. **Unbalanced**.',
  'brackets.unclosed':
    'The end, but the stack isn’t empty: an opening bracket never closed. **Unbalanced**.',
  'brackets.balanced':
    'The end, and the stack is empty: every bracket found its partner. **Balanced**.',

  // Lessons (engine/lesson/compile.ts)
  'lesson.predict': 'What happens next?',

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

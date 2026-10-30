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

  // Binary search (engine/algorithms/searching/operations.ts)
  'binary-search.start':
    'Look for **{value}** among {size} items. **low** starts at index 0, **high** at index {high}.',
  'binary-search.first.start':
    'Look for the **first {value}**. **low** starts at 0, **high** at {high}, and there’s no answer yet.',
  'binary-search.last.start':
    'Look for the **last {value}**. **low** starts at 0, **high** at {high}, and there’s no answer yet.',
  'binary-search.empty':
    'The array is empty, so there’s nothing to search: **{value}** isn’t here.',
  'binary-search.mid':
    'The middle of index {low} to {high} is ({low} + {high}) ÷ 2 = **{mid}**, rounded down. It holds **{item}**.',
  'binary-search.found': '**{value}** is at index {mid}. Found it! Checks made: {checks}.',
  'binary-search.go-right':
    '**{item}** is less than **{value}**, so {value} can only be further right. **low** moves to {low}.',
  'binary-search.go-left':
    '**{item}** is more than **{value}**, so {value} can only be further left. **high** moves to {high}.',
  'binary-search.not-found':
    '**low** ({low}) has passed **high** ({high}): nothing is left. **{value}** isn’t here. Checks made: {checks}.',
  'binary-search.not-found.unsorted':
    'Nothing is left, so it says **{value}** isn’t here. But the array isn’t **sorted**, so that may be wrong.',
  'binary-search.first.match':
    'A **{value}** at index {mid}. Remember it, but an earlier one could be to the left: **high** moves to {high}.',
  'binary-search.last.match':
    'A **{value}** at index {mid}. Remember it, but a later one could be to the right: **low** moves to {low}.',
  'binary-search.first.done':
    'Nothing is left. The **first {value}** is the one remembered, at index {result}. Checks made: {checks}.',
  'binary-search.last.done':
    'Nothing is left. The **last {value}** is the one remembered, at index {result}. Checks made: {checks}.',

  // Sorting (engine/algorithms/sorting/operations.ts)
  'sort.trivial.empty': 'An empty array is already sorted: there’s nothing to do.',
  'sort.trivial.one': 'One item is already sorted: there’s nothing to compare it with.',
  'sort.done': 'Sorted! Comparisons: {comparisons}. Swaps: {swaps}.',
  'sort.done.rest': 'Sorted! These last rounds took comparisons: {comparisons}, swaps: {swaps}.',
  'bubble.start':
    'Bubble sort {size} items: compare each pair of neighbours, and swap them if they’re out of order.',
  'bubble.compare.swap': 'Compare **{a}** and **{b}**. {a} is bigger, so they swap.',
  'bubble.compare.keep': 'Compare **{a}** and **{b}**. They’re in order, so leave them.',
  'bubble.swapped': '**{a}** moves one place right, **{b}** one place left.',
  'bubble.pass-done':
    'Pass {pass} done: **{value}**, the biggest of the rest, has bubbled to index {index}. It’s in place.',
  'bubble.last-pass': 'Pass {pass} done: the last two items are in place, so everything is.',
  'bubble.early-exit':
    'Pass {pass} made **no swaps**, so every pair is in order. The array is sorted: stop early.',
  'selection.start':
    'Selection sort {size} items: find the smallest, swap it to the front, then repeat on the rest.',
  'selection.scan':
    'Find the smallest from index {i} to {last}. **min** starts on **{value}**, at index {i}.',
  'selection.new-min': '**{value}** is smaller than **{min}**: it’s the new **min**.',
  'selection.not-smaller': '**{value}** isn’t smaller than **{min}**. Keep looking.',
  'selection.in-place':
    'The smallest, **{min}**, is already at index {i}. No swap needed: it’s in place.',
  'selection.swap':
    'The smallest is **{min}**. Swap it with **{value}** at index {i}: {min} is now in place.',
  'insertion.start':
    'Insertion sort {size} items: take each item in turn and slide it into place among those before it.',
  'insertion.take':
    'Take out **{key}**, the item at index {i}. Everything to its left is sorted so far.',
  'insertion.shift': '**{value}** is bigger than **{key}**, so shift it one place right.',
  'insertion.insert':
    '**{value}** isn’t bigger than **{key}**, so {key} drops into the gap at index {index}.',
  'insertion.stay':
    '**{value}** isn’t bigger than **{key}**, so {key} goes back where it was. Nothing moved.',
  'insertion.front': 'Nothing is left to compare, so **{key}** drops in at the front, index 0.',
  'insertion.done': 'Sorted! Comparisons: {comparisons}. Shifts: {shifts}.',
  'insertion.done.rest':
    'Sorted! These last rounds took comparisons: {comparisons}, shifts: {shifts}.',

  'quick.start':
    'Quick sort {size} items: pick a **pivot**, put smaller items left of it and bigger ones right, then repeat.',
  'quick.start.random':
    'Quick sort {size} items, with a **random pivot** each time instead of the last item.',
  'quick.partition':
    'Partition index {lo} to {hi} around the **pivot**, **{pivot}**. **i** marks where the next small item goes.',
  'quick.small': '**{value}** ≤ **{pivot}**: it belongs on the left, so swap it to index {i}.',
  'quick.small.stay':
    '**{value}** ≤ **{pivot}**: it belongs on the left, and it’s already there. **i** moves on.',
  'quick.big': '**{value}** > **{pivot}**: it stays on the right side for now.',
  'quick.swapped': '**{value}** swaps with **{other}**, into index {i}. **i** moves on.',
  'quick.place':
    'Swap the pivot **{pivot}** into index {index}: smaller or equal on its left, bigger on its right. It’s in place.',
  'quick.place.end':
    '**{pivot}** is the biggest here, so it stays at index {index}, with everything left of it smaller. In place.',
  'quick.single': 'Only **{value}** is left between placed items, so it’s in place too.',
  'quick.random':
    'Pick a **random pivot**: **{pivot}**. Swap it to the end, then partition as usual.',
  'quick.random.last': 'Pick a **random pivot**: **{pivot}**, which is already at the end.',
  'merge.start':
    'Merge sort {size} items: split in half until each piece is one item, then merge the pieces back in order.',
  'merge.split': 'Split into two halves: **{left}** and **{right}**.',
  'merge.take': '**{value}** is smaller than **{other}**, so it goes up next.',
  'merge.take.equal':
    '**{value}** and **{other}** are equal: take the left one first, so equal values keep their order.',
  'merge.rest': 'One half is used up, so the rest of the other, **{items}**, goes up in order.',
  'merge.merged': 'Merged: **{items}** is one sorted run.',
  'merge.done': 'Sorted! Comparisons: {comparisons}.',

  // Two pointers (engine/algorithms/patterns/two-pointers.ts)
  'pointers.reverse.start':
    'Reverse in place: **left** starts at the first item, **right** at the last.',
  'pointers.reverse.swap': 'Swap **{a}** and **{b}**, then move both pointers one step in.',
  'pointers.reverse.done':
    '**left** and **right** have met in the middle, so it’s reversed. Swaps made: {swaps}.',
  'pointers.reverse.trivial': 'With {size} items there’s nothing to reverse.',
  'pointers.pair.start':
    'Find two items that add up to **{target}**. **left** starts at the smallest, **right** at the biggest.',
  'pointers.pair.small':
    '{a} + {b} = **{sum}**, less than {target}. For a bigger sum, **left** moves right.',
  'pointers.pair.big':
    '{a} + {b} = **{sum}**, more than {target}. For a smaller sum, **right** moves left.',
  'pointers.pair.found': '{a} + {b} = **{sum}**. Found the pair, at index {left} and {right}.',
  'pointers.pair.none': '**left** and **right** have met: no two items add up to **{target}**.',
  'pointers.pair.unsorted':
    'The pointers have met with no pair for **{target}**. But the array isn’t sorted, so one may be missed.',
  'pointers.pair.too-short': 'With {size} items there’s no pair to add up to **{target}**.',
  'pointers.dedupe.start':
    'Remove repeats in place. **{value}** is kept; **write** marks where the next new value goes.',
  'pointers.dedupe.repeat': '**{value}** is the same as the last value kept: skip it.',
  'pointers.dedupe.keep':
    '**{value}** is new: copy it down to index {write}, and **write** moves on.',
  'pointers.dedupe.keep-in-place':
    '**{value}** is new, and it’s already at index {write}: keep it, and **write** moves on.',
  'pointers.dedupe.done':
    'The first {count} items are the unique values; the other {dropped} are dropped. One pass, no new array.',
  'pointers.dedupe.trivial': 'With {size} items there can’t be any repeats.',

  // Sliding window (engine/algorithms/patterns/sliding-window.ts)
  'window.sum.start': 'A window of **{k}**: add up the first {k} items. Sum: **{sum}**.',
  'window.sum.slide':
    'Slide right: add **{entering}**, take away **{leaving}**. Sum: **{sum}**, without adding the rest again.',
  'window.sum.slide.best':
    'Slide right: add **{entering}**, take away **{leaving}**. Sum: **{sum}**, the best so far.',
  'window.sum.done':
    'The biggest sum of {k} in a row is **{best}**, at index {start} to {end}. One pass: **O(n)**.',
  'window.too-small': 'A window of {k} doesn’t fit in {size} items: there’s nothing to slide.',
  'window.not-numbers': 'This needs numbers to add up, and **{value}** isn’t one.',
  'window.empty': 'The array is empty, so there’s no window.',
  'window.unique.start':
    'Find the longest run with no repeats. The window starts empty, at index 0.',
  'window.unique.grow':
    'Add **{value}**: it’s not in the window yet, so the window grows to {length}.',
  'window.unique.grow.best':
    'Add **{value}**: no repeat, so the window grows to {length}, the longest so far.',
  'window.unique.repeat':
    '**{value}** is already in the window. Shrink it from the left until it isn’t.',
  'window.unique.shrink': 'Drop **{value}** from the left. The window is now {length} long.',
  'window.unique.shrink.empty':
    'Drop **{value}** from the left. For a moment, the window is empty.',
  'window.unique.done':
    'The longest run with no repeats has **{best}** items, index {start} to {end}. Each item went in and out once.',
  'window.max.start':
    'Find the biggest item in each window of **{k}**. The **deque** keeps only items that could still be the biggest.',
  'window.max.expire':
    '**{value}** has slid out of the window, so it leaves the front of the deque.',
  'window.max.pop':
    '**{value}** ≤ **{incoming}** and leaves sooner, so it can never be the biggest again: pop it.',
  'window.max.push': 'Push **{value}** onto the back of the deque. Deque: {deque}.',
  'window.max.max':
    'Window {start} to {end}: the biggest is at the front of the deque, **{value}**.',
  'window.max.done':
    'Window maxima: **{maxima}**. Each item joined and left the deque at most once: **O(n)**.',
  'window.k': 'The window is now **{k}** items wide.',
  'window.k.limit': 'The window can’t be {k} items wide: it must be 1 to {size}.',

  // Linked lists (engine/structures/linked-list/operations.ts)
  'list.create': 'Make a new node for **{value}**. Nothing points to it yet.',
  'list.search.compare':
    'Is **cur** ({current}) the **{value}** we’re looking for? No: follow **next**.',
  'list.search.found': '**cur** holds **{value}**. Found it.',
  'list.search.not-found':
    '**cur** fell off the end (null): **{value}** isn’t in the list. That took **O(n)**.',
  'list.search.empty': 'The list is empty (head is null), so **{value}** isn’t in it.',
  'list.head.link': 'Point its **next** at the current head, {head}.',
  'list.head.link-back': 'And point {head}’s **prev** back at the new node.',
  'list.first': 'The list was empty: **{value}** is now the only node.',
  'list.head.moved': 'Move **head** to the new node. Nothing else moved: **O(1)**.',
  'list.walk.start': 'No tail pointer, so start **cur** at the head, {value}, and walk.',
  'list.walk': 'Its next isn’t null, so follow it: **cur** is at {value}.',
  'list.walk.end': '**cur** is at {value}, whose next is null: the last node.',
  'list.tail.link':
    'The **tail** pointer finds the last node, {last}, at once. Point its **next** at the new node.',
  'list.tail.link.walked': 'Point {last}’s **next** at the new node.',
  'list.tail.link-back': 'And point the new node’s **prev** back at {last}.',
  'list.tail.moved': 'Move **tail** to the new node. No walking: **O(1)** with a tail pointer.',
  'list.tail.walked':
    'Done, but reaching the end took {count} steps: **O(n)** without a tail pointer.',
  'list.after.not-found': '**{target}** isn’t in the list, so there’s nothing to insert after.',
  'list.after.link': 'Point the new node’s **next** at {next}, the node after {target}.',
  'list.after.link.last': '{target} is last, so the new node’s **next** stays null.',
  'list.after.link.doubly': 'Point the new node’s **next** at {next} and its **prev** at {target}.',
  'list.after.link.last.doubly':
    '{target} is last: the new node’s **prev** points at it, and its **next** stays null.',
  'list.after.relinked':
    'Now point {target}’s **next** at **{value}**. Pointers changed; nothing moved.',
  'list.after.relinked.doubly':
    'Now {target}’s **next** and the following node’s **prev** point at **{value}**. Nothing moved.',
  'list.before.singly':
    'A singly linked list has no **prev** pointers, so it can’t step back from {target}.',
  'list.before.not-found': '**{target}** isn’t in the list, so there’s nothing to insert before.',
  'list.before.link': 'Point the new node’s **next** at {target} and its **prev** at {prev}.',
  'list.before.link.first':
    'Point the new node’s **next** at {target}. {target} is the head, so its **prev** stays null.',
  'list.before.relinked': 'Now {prev}’s **next** and {target}’s **prev** point at **{value}**.',
  'list.before.relinked.head':
    'Now {target}’s **prev** points at **{value}**, and **head** moves to it.',
  'list.delete.empty': 'The list is empty, so there’s no **{value}** to delete.',
  'list.delete.found': '**cur** holds **{value}**. This is the node to remove.',
  'list.delete.not-found': '**{value}** isn’t in the list, so nothing is deleted.',
  'list.delete.only': '**{value}** is the only node: **head** becomes null.',
  'list.delete.head': '**{value}** is the head: move **head** on to {next}.',
  'list.delete.unlink': 'Point {prev}’s **next** past **{value}**, straight to {next}.',
  'list.delete.unlink.tail':
    'Point {prev}’s **next** past **{value}**, to null, and move **tail** back to {prev}.',
  'list.delete.forward': 'Point {prev}’s **next** past **{value}**, to {next}.',
  'list.delete.forward.head': '**{value}** is the head: move **head** on to {next}.',
  'list.delete.back':
    'Point {next}’s **prev** past **{value}**, back to {prev}. The node knew both neighbours: **O(1)**.',
  'list.delete.back.tail': '**{value}** is the tail: move **tail** back to {prev}.',
  'list.delete.freed': 'Nothing points to **{value}** any more, so it’s gone.',
  'list.back.singly':
    'A singly linked list has no **prev** pointers: it can only be walked from the head.',
  'list.traverse.empty': 'The list is empty: head is null, so there’s nothing to visit.',
  'list.visit': 'Visit **{value}**.',
  'list.traversed':
    '**cur** reached null: all {count} nodes visited, from the head. That’s **O(n)**.',
  'list.traversed.back':
    '**cur** reached null: all {count} nodes visited backwards, from the tail.',
  'list.reverse.short': 'With fewer than two nodes, the list is already its own reverse.',
  'list.reverse.save': 'Save **next** = {next}, so the rest of the list isn’t lost.',
  'list.reverse.save.last': '{cur} is the last node: **next** is null.',
  'list.reverse.flip': 'Flip {cur}’s **next** to point back at **prev**, {prev}.',
  'list.reverse.flip.first':
    'Flip {cur}’s **next** to **prev**, which is null: {cur} will be the new tail.',
  'list.reverse.advance': 'Step forward: **prev** = {prev}, **cur** = {cur}.',
  'list.reverse.advance.end':
    'Step forward: **prev** = {prev}, and **cur** is null. Every arrow is flipped.',
  'list.reverse.head':
    'Make **head** point at **prev**, {head}. Each node was visited once: **O(n)**.',
  'list.reverse.done': 'Redrawn with the head on the left: the same nodes, in reverse order.',

  // Hash table (engine/structures/hash-table/operations.ts)
  'hash.fn.sum': 'Add up the letter codes of **{key}**: h("{key}") = {hash}.',
  'hash.fn.polynomial':
    'Mix the letter codes of **{key}**, multiplying by {base} at each letter: h("{key}") = {hash}.',
  'hash.fn.length': 'This **bad hash** only counts the letters of **{key}**: h("{key}") = {hash}.',
  'hash.index': '{hash} mod {size} = {bucket}, so **{key}** belongs in bucket {bucket}.',
  'hash.resize.check':
    '{count} keys in {size} buckets would make the **load factor** {load}, over the limit of {limit}.',
  'hash.resize': 'So first, make a bigger table: {to} buckets instead of {from}.',
  'hash.rehash': '**Rehash** {key}: with {size} buckets it belongs in bucket {bucket}.',
  'hash.rehash.probed': '**Rehash** {key}: bucket {home} is taken, so it probes on to {bucket}.',
  'hash.resized':
    'All {count} keys moved: **O(n)**, but only now and then, so put is still **O(1)** on average.',
  'hash.updated': '**{key}** is already here, so its value changes from {old} to {value}.',
  'hash.collision':
    'Bucket {bucket} already holds **{other}**: a **collision**. Is {other} the key **{key}**? No.',
  'hash.chain.next': 'Is **{other}** the key **{key}**? No: next in the chain.',
  'hash.placed': 'Bucket {bucket} is empty, so **{key}** goes straight in.',
  'hash.chain.appended':
    '**{key}** isn’t in the chain yet, so it joins the end of bucket {bucket}’s chain.',
  'hash.probe.tombstone':
    'Bucket {bucket} has a **tombstone**. Remember it, but check on: **{key}** may be further along.',
  'hash.collision.probe':
    'Bucket {bucket} holds **{other}**: a **collision**. Probe the next bucket, {next}.',
  'hash.probe.next': 'Bucket {bucket} holds **{other}**. Try bucket {next}.',
  'hash.probe.reuse':
    '**{key}** isn’t in the table, so it takes the tombstone’s place in bucket {bucket}.',
  'hash.probe.placed':
    'Bucket {bucket} is empty: **{key}** goes in here, away from its home bucket.',
  'hash.full': 'All {size} buckets are taken, so **{key}** has nowhere to go: the table is full.',
  'hash.found': 'Found **{key}**: {value}.',
  'hash.missing.chain': 'The chain ends without **{key}**, so it isn’t in the table.',
  'hash.missing.empty': 'Bucket {bucket} is empty, so **{key}** isn’t in the table.',
  'hash.missing.everywhere': 'Every bucket has been checked: **{key}** isn’t in the table.',
  'hash.probe.skip': 'Bucket {bucket} holds **{other}**, not **{key}**. Probe on to {next}.',
  'hash.probe.past-tombstone':
    'Bucket {bucket} is a **tombstone**: a key was removed here, so keep going to {next}.',
  'hash.remove.missing': '**{key}** isn’t in the table, so there’s nothing to remove.',
  'hash.chain.removed':
    'Unlink **{key}** from bucket {bucket}’s chain. The rest of the chain closes up.',
  'hash.tombstone':
    '**{key}** is replaced by a **tombstone**, not emptied, so searches for keys further on keep going.',

  // Big O (engine/foundations/big-o/operations.ts)
  'bigo.n-range': 'n must be a whole number from 1 to {max}.',
  'bigo.n': 'n = {n}. The dots show how many steps each curve takes at this size.',
  'bigo.n.zoom': 'n = {n}. The chart zooms out to show n up to {xMax}.',
  'bigo.show.constant':
    '**{label}**, constant: the same work whatever n is, like reading an array item by its index.',
  'bigo.show.logarithmic':
    '**{label}**: halve the problem every step, like binary search. At n = {n}, about {steps} steps.',
  'bigo.show.linear':
    '**{label}**, linear: one step per item, like a single loop. {steps} steps at n = {n}.',
  'bigo.show.linearithmic':
    '**{label}**: a little more than linear. The best general sorting algorithms land here.',
  'bigo.show.quadratic':
    '**{label}**, quadratic: a loop inside a loop. Already {steps} steps at n = {n}.',
  'bigo.show.exponential':
    '**{label}**, exponential: each extra item doubles the work. Only tiny inputs are practical.',
  'bigo.show.scaled-linear':
    '**{label}**: a few steps per item, plus a few more. Still a straight line.',
  'bigo.show.scaled-quadratic': '**{label}**: half of n², so it starts out small…',
  'bigo.run.lookup': 'Run a **constant lookup**: read one item by its index, with n = {n}.',
  'bigo.run.loop': 'Run a **single loop** over n = {n} items, counting each step.',
  'bigo.run.nested': 'Run a **nested loop**: for each of the {n} items, loop over all {n} again.',
  'bigo.run.halving': 'Run a **halving loop**: start at n = {n} and halve it until it reaches 1.',
  'bigo.count': 'Steps so far: **{count}**.',
  'bigo.count.skip': 'Steps so far: **{count}** (skipping ahead).',
  'bigo.done.lookup':
    'Done in **{count}** step, whatever n is: the dot sits on the **{label}** line.',
  'bigo.done.loop': 'Done: **{count}** steps for n = {n}. The dot lands on the **{label}** curve.',
  'bigo.done.nested':
    'Done: **{count}** steps for n = {n}, that’s n × n. The dot lands on the **{label}** curve.',
  'bigo.done.halving':
    'Done: **{count}** halvings for n = {n}: log₂ n, rounded down. The dot sits on the **{label}** curve.',

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

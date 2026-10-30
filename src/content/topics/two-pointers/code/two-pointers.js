// Two indices moving through one array.

function reverse(a) {
  let left = 0, right = a.length - 1; // @line reverse-start
  while (left < right) {
    [a[left], a[right]] = [a[right], a[left]]; // @line reverse-swap
    left++, right--; // @line reverse-swap
  }
  return a; // @line reverse-done
}

// a is sorted, smallest first.
function pairSum(a, target) {
  let left = 0, right = a.length - 1; // @line pair-start
  while (left < right) {
    const sum = a[left] + a[right];
    if (sum === target) return [left, right]; // @line pair-found
    if (sum < target) {
      left++; // @line pair-left
    } else {
      right--; // @line pair-right
    }
  }
  return null; // @line pair-none
}

// a is sorted. Keeps one of each value at the front.
function removeDuplicates(a) {
  let write = 1; // @line dedupe-start
  for (let read = 1; read < a.length; read++) {
    if (a[read] === a[write - 1]) continue; // @line dedupe-skip
    a[write] = a[read]; // @line dedupe-keep
    write++; // @line dedupe-keep
  }
  return write; // @line dedupe-done
}

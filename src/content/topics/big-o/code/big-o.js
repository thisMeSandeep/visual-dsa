// Each function counts its steps, so you can see how the count grows with n.

function lookup(items, i) { // @line lookup-start
  let steps = 0;
  const item = items[i]; // @line lookup-step
  steps++; // @line lookup-step
  return steps; // @line lookup-done
}

function loop(items) { // @line loop-start
  let steps = 0;
  for (const item of items) {
    steps++; // @line loop-step
  }
  return steps; // @line loop-done
}

function nested(items) { // @line nested-start
  let steps = 0;
  for (const a of items) {
    for (const b of items) {
      steps++; // @line nested-step
    }
  }
  return steps; // @line nested-done
}

function halving(n) { // @line halving-start
  let steps = 0;
  while (n > 1) {
    n = Math.floor(n / 2); // @line halving-step
    steps++; // @line halving-step
  }
  return steps; // @line halving-done
}

// Best and worst case: linear search stops as soon as it finds the value.
function search(items, value) {
  for (let i = 0; i < items.length; i++) {
    if (items[i] === value) { // @line search-compare
      return i; // @line search-found
    }
  }
  return -1; // @line search-not-found
}

// Amortised cost: push is quick, except when a full array doubles.
function push(array, value) {
  if (array.size === array.slots.length) grow(array); // @line push-check
  array.slots[array.size] = value; // @line push
  array.size++; // @line push
}

function grow(array) {
  const bigger = new Array(array.slots.length * 2); // @line grow
  for (let i = 0; i < array.size; i++) {
    bigger[i] = array.slots[i]; // @line copy
  }
  array.slots = bigger; // @line grow-done
}

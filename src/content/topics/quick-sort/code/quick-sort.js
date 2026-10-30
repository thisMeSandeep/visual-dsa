// Sorts a[lo..hi], smallest first.

function quickSort(a, lo = 0, hi = a.length - 1, randomPivot = false) {
  if (lo >= hi) return;
  const p = partition(a, lo, hi, randomPivot);
  quickSort(a, lo, p - 1, randomPivot);
  quickSort(a, p + 1, hi, randomPivot);
}

// Lomuto: the pivot is the last item.
function partition(a, lo, hi, randomPivot) {
  if (randomPivot) swap(a, lo + Math.floor(Math.random() * (hi - lo + 1)), hi); // @line random-pivot
  const pivot = a[hi]; // @line pivot
  let i = lo; // @line pivot
  for (let j = lo; j < hi; j++) {
    if (a[j] <= pivot) { // @line compare
      swap(a, i, j); // @line swap
      i++;
    }
  }
  swap(a, i, hi); // @line place
  return i;
}

function swap(a, i, j) {
  [a[i], a[j]] = [a[j], a[i]];
}

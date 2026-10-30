// Sorts a[lo..hi - 1], smallest first.

function mergeSort(a, lo = 0, hi = a.length) {
  if (hi - lo < 2) return;
  const mid = Math.floor((lo + hi) / 2); // @line split
  mergeSort(a, lo, mid);
  mergeSort(a, mid, hi);
  merge(a, lo, mid, hi);
}

function merge(a, lo, mid, hi) {
  const left = a.slice(lo, mid);
  const right = a.slice(mid, hi);
  let i = 0;
  let j = 0;
  let k = lo;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      a[k++] = left[i++]; // @line take-left
    } else {
      a[k++] = right[j++]; // @line take-right
    }
  }
  while (i < left.length) a[k++] = left[i++]; // @line rest
  while (j < right.length) a[k++] = right[j++]; // @line rest
}

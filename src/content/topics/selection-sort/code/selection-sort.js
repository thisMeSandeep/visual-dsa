// Sorts a in place, smallest first.

function selectionSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i; // @line scan
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[min]) { // @line compare
        min = j; // @line new-min
      }
    }
    if (min !== i) { // @line place
      [a[i], a[min]] = [a[min], a[i]]; // @line swap
    }
  }
}

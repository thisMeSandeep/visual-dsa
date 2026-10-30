// Sorts a in place, smallest first.

function bubbleSort(a) {
  const n = a.length;
  for (let pass = 1; pass < n; pass++) {
    let swapped = false;
    for (let j = 0; j < n - pass; j++) {
      if (a[j] > a[j + 1]) { // @line compare
        [a[j], a[j + 1]] = [a[j + 1], a[j]]; // @line swap
        swapped = true; // @line swap
      }
    } // @line pass-done
    if (!swapped) return; // @line early-exit
  }
}

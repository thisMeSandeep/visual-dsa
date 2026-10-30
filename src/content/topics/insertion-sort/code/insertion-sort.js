// Sorts a in place, smallest first.

function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i]; // @line take
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]; // @line shift
      j--;
    }
    a[j + 1] = key; // @line insert
  }
}

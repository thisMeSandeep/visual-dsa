#include <utility>
#include <vector>

// Sorts a in place, smallest first.
void bubbleSort(std::vector<int>& a) {
  std::size_t n = a.size();
  for (std::size_t pass = 1; pass < n; pass++) {
    bool swapped = false;
    for (std::size_t j = 0; j < n - pass; j++) {
      if (a[j] > a[j + 1]) { // @line compare
        std::swap(a[j], a[j + 1]); // @line swap
        swapped = true; // @line swap
      }
    } // @line pass-done
    if (!swapped) return; // @line early-exit
  }
}

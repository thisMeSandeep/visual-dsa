#include <utility>
#include <vector>

// Sorts a in place, smallest first.
void selectionSort(std::vector<int>& a) {
  std::size_t n = a.size();
  for (std::size_t i = 0; i + 1 < n; i++) {
    std::size_t min = i; // @line scan
    for (std::size_t j = i + 1; j < n; j++) {
      if (a[j] < a[min]) { // @line compare
        min = j; // @line new-min
      }
    }
    if (min != i) { // @line place
      std::swap(a[i], a[min]); // @line swap
    }
  }
}

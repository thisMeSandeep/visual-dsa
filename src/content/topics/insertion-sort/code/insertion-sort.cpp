#include <vector>

// Sorts a in place, smallest first.
void insertionSort(std::vector<int>& a) {
  for (std::size_t i = 1; i < a.size(); i++) {
    int key = a[i]; // @line take
    std::size_t j = i;
    while (j > 0 && a[j - 1] > key) {
      a[j] = a[j - 1]; // @line shift
      j--;
    }
    a[j] = key; // @line insert
  }
}

#include <vector>

// Sorts a[lo..hi - 1], smallest first. Start with mergeSort(a, 0, a.size()).
void merge(std::vector<int>& a, std::size_t lo, std::size_t mid, std::size_t hi) {
  std::vector<int> left(a.begin() + lo, a.begin() + mid);
  std::vector<int> right(a.begin() + mid, a.begin() + hi);
  std::size_t i = 0, j = 0, k = lo;
  while (i < left.size() && j < right.size()) {
    if (left[i] <= right[j]) {
      a[k++] = left[i++]; // @line take-left
    } else {
      a[k++] = right[j++]; // @line take-right
    }
  }
  while (i < left.size()) a[k++] = left[i++]; // @line rest
  while (j < right.size()) a[k++] = right[j++]; // @line rest
}

void mergeSort(std::vector<int>& a, std::size_t lo, std::size_t hi) {
  if (hi - lo < 2) return;
  std::size_t mid = (lo + hi) / 2; // @line split
  mergeSort(a, lo, mid);
  mergeSort(a, mid, hi);
  merge(a, lo, mid, hi);
}

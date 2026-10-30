#include <random>
#include <utility>
#include <vector>

// Lomuto: the pivot is the last item.
int partition(std::vector<int>& a, int lo, int hi, bool randomPivot) {
  static std::mt19937 rng{std::random_device{}()};
  if (randomPivot) std::swap(a[std::uniform_int_distribution<int>(lo, hi)(rng)], a[hi]); // @line random-pivot
  int pivot = a[hi]; // @line pivot
  int i = lo; // @line pivot
  for (int j = lo; j < hi; j++) {
    if (a[j] <= pivot) { // @line compare
      std::swap(a[i], a[j]); // @line swap
      i++;
    }
  }
  std::swap(a[i], a[hi]); // @line place
  return i;
}

// Sorts a[lo..hi], smallest first. Start with quickSort(a, 0, a.size() - 1).
void quickSort(std::vector<int>& a, int lo, int hi, bool randomPivot = false) {
  if (lo >= hi) return;
  int p = partition(a, lo, hi, randomPivot);
  quickSort(a, lo, p - 1, randomPivot);
  quickSort(a, p + 1, hi, randomPivot);
}

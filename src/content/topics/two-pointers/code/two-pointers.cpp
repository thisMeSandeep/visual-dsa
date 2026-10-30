#include <optional>
#include <utility>
#include <vector>

// Two indices moving through one array.

void reverse(std::vector<int>& a) {
  int left = 0, right = static_cast<int>(a.size()) - 1; // @line reverse-start
  while (left < right) {
    std::swap(a[left], a[right]); // @line reverse-swap
    left++, right--; // @line reverse-swap
  }
  return; // @line reverse-done
}

// a is sorted, smallest first.
std::optional<std::pair<int, int>> pairSum(const std::vector<int>& a, int target) {
  int left = 0, right = static_cast<int>(a.size()) - 1; // @line pair-start
  while (left < right) {
    int sum = a[left] + a[right];
    if (sum == target) return std::make_pair(left, right); // @line pair-found
    if (sum < target) {
      left++; // @line pair-left
    } else {
      right--; // @line pair-right
    }
  }
  return std::nullopt; // @line pair-none
}

// a is sorted. Keeps one of each value at the front.
std::size_t removeDuplicates(std::vector<int>& a) {
  std::size_t write = 1; // @line dedupe-start
  for (std::size_t read = 1; read < a.size(); read++) {
    if (a[read] == a[write - 1]) continue; // @line dedupe-skip
    a[write] = a[read]; // @line dedupe-keep
    write++; // @line dedupe-keep
  }
  return write; // @line dedupe-done
}

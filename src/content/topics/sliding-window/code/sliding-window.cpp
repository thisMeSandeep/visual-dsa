#include <algorithm>
#include <deque>
#include <unordered_set>
#include <vector>

// The biggest sum of k neighbours.
int maxSum(const std::vector<int>& a, std::size_t k) {
  int sum = 0; for (std::size_t i = 0; i < k; i++) sum += a[i]; // @line sum-start
  int best = sum; // @line sum-start
  for (std::size_t right = k; right < a.size(); right++) {
    sum += a[right] - a[right - k]; // @line sum-slide
    best = std::max(best, sum); // @line sum-slide
  }
  return best; // @line sum-done
}

// The longest run with no repeated value.
std::size_t longestUnique(const std::vector<int>& a) {
  std::unordered_set<int> seen; std::size_t left = 0, best = 0; // @line unique-start
  for (std::size_t right = 0; right < a.size(); right++) {
    while (seen.count(a[right])) {
      seen.erase(a[left++]); // @line unique-shrink
    }
    seen.insert(a[right]); // @line unique-grow
    best = std::max(best, right - left + 1); // @line unique-grow
  }
  return best; // @line unique-done
}

// The biggest item in each window of k. The deque holds
// indices whose values go down from front to back.
std::vector<int> windowMax(const std::vector<int>& a, std::size_t k) {
  std::deque<std::size_t> deque; std::vector<int> maxima; // @line max-start
  for (std::size_t right = 0; right < a.size(); right++) {
    if (!deque.empty() && deque.front() + k <= right) deque.pop_front(); // @line max-expire
    while (!deque.empty() && a[deque.back()] <= a[right]) {
      deque.pop_back(); // @line max-pop
    }
    deque.push_back(right); // @line max-push
    if (right + 1 >= k) maxima.push_back(a[deque.front()]); // @line max-record
  }
  return maxima;
}

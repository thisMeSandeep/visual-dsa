#include <vector>

// a is sorted, smallest first. low and high mark the part
// still worth searching; everything outside it is ruled out.

int binarySearch(const std::vector<int>& a, int target) {
  int low = 0; // @line init
  int high = static_cast<int>(a.size()) - 1; // @line init
  while (low <= high) {
    int mid = (low + high) / 2; // @line mid
    if (a[mid] == target) {
      return mid; // @line found
    } else if (a[mid] < target) {
      low = mid + 1; // @line go-right
    } else {
      high = mid - 1; // @line go-left
    }
  }
  return -1; // @line not-found
}

// With duplicates: remember a match, keep searching left.
int findFirst(const std::vector<int>& a, int target) {
  int low = 0; // @line first-init
  int high = static_cast<int>(a.size()) - 1; // @line first-init
  int result = -1; // @line first-init
  while (low <= high) {
    int mid = (low + high) / 2; // @line first-mid
    if (a[mid] == target) {
      result = mid; // @line first-match
      high = mid - 1; // @line first-match
    } else if (a[mid] < target) {
      low = mid + 1; // @line first-go-right
    } else {
      high = mid - 1; // @line first-go-left
    }
  }
  return result; // @line first-done
}

// The same, but keep searching right after a match.
int findLast(const std::vector<int>& a, int target) {
  int low = 0; // @line last-init
  int high = static_cast<int>(a.size()) - 1; // @line last-init
  int result = -1; // @line last-init
  while (low <= high) {
    int mid = (low + high) / 2; // @line last-mid
    if (a[mid] == target) {
      result = mid; // @line last-match
      low = mid + 1; // @line last-match
    } else if (a[mid] < target) {
      low = mid + 1; // @line last-go-right
    } else {
      high = mid - 1; // @line last-go-left
    }
  }
  return result; // @line last-done
}

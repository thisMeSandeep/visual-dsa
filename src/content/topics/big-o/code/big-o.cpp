#include <vector>

// Each function counts its steps, so you can see how the count grows with n.

int lookup(const std::vector<int>& items, std::size_t i) { // @line lookup-start
  int steps = 0;
  int item = items[i]; // @line lookup-step
  steps++; // @line lookup-step
  return steps; // @line lookup-done
}

int loop(const std::vector<int>& items) { // @line loop-start
  int steps = 0;
  for (int item : items) {
    steps++; // @line loop-step
  }
  return steps; // @line loop-done
}

int nested(const std::vector<int>& items) { // @line nested-start
  int steps = 0;
  for (int a : items) {
    for (int b : items) {
      steps++; // @line nested-step
    }
  }
  return steps; // @line nested-done
}

int halving(int n) { // @line halving-start
  int steps = 0;
  while (n > 1) {
    n = n / 2; // @line halving-step
    steps++; // @line halving-step
  }
  return steps; // @line halving-done
}

// Best and worst case: linear search stops as soon as it finds the value.
int search(const std::vector<int>& items, int value) {
  for (std::size_t i = 0; i < items.size(); i++) {
    if (items[i] == value) { // @line search-compare
      return static_cast<int>(i); // @line search-found
    }
  }
  return -1; // @line search-not-found
}

// Amortised cost: push is quick, except when a full array doubles.
struct GrowingArray {
  std::vector<int> slots = std::vector<int>(1);
  std::size_t size = 0;

  void push(int value) {
    if (size == slots.size()) grow(); // @line push-check
    slots[size] = value; // @line push
    size++; // @line push
  }

  void grow() {
    std::vector<int> bigger(slots.size() * 2); // @line grow
    for (std::size_t i = 0; i < size; i++) {
      bigger[i] = slots[i]; // @line copy
    }
    slots = bigger; // @line grow-done
  }
};

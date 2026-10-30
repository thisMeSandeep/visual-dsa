#include <functional>
#include <stdexcept>
#include <vector>

class DynamicArray {
  std::vector<int> slots;
  std::size_t size = 0;  // items are in slots 0 to size - 1

 public:
  explicit DynamicArray(std::size_t capacity) : slots(capacity) {}

  int get(std::size_t index) const {
    if (index >= size) { // @line get-check
      throw std::out_of_range("Index out of bounds"); // @line get-out-of-bounds
    }
    return slots[index]; // @line get
  }

  void set(std::size_t index, int value) {
    if (index >= size) { // @line set-check
      throw std::out_of_range("Index out of bounds"); // @line set-out-of-bounds
    }
    slots[index] = value; // @line set
  }

  void push(int value) {
    if (size == slots.size()) grow(); // @line push-check
    slots[size] = value; // @line push
    size++; // @line push
  }

  void insert(std::size_t index, int value) {
    if (index > size) { // @line insert-check
      throw std::out_of_range("Index out of bounds"); // @line insert-out-of-bounds
    }
    if (size == slots.size()) grow();
    for (std::size_t j = size; j > index; j--) {
      slots[j] = slots[j - 1]; // @line shift-right
    }
    slots[index] = value; // @line insert
    size++; // @line insert
  }

  int removeAt(std::size_t index) {
    if (index >= size) { // @line remove-check
      throw std::out_of_range("Index out of bounds"); // @line remove-out-of-bounds
    }
    int value = slots[index]; // @line remove-read
    for (std::size_t j = index + 1; j < size; j++) {
      slots[j - 1] = slots[j]; // @line shift-left
    }
    size--; // @line remove-done
    slots[size] = 0; // @line remove-done
    return value;
  }

  int search(int value) const {
    for (std::size_t i = 0; i < size; i++) {
      if (slots[i] == value) { // @line search-compare
        return static_cast<int>(i); // @line search-found
      }
    }
    return -1; // @line search-not-found
  }

  void traverse(const std::function<void(int)>& visit) const {
    for (std::size_t i = 0; i < size; i++) {
      visit(slots[i]); // @line traverse-visit
    }
  }

 private:
  void grow() {
    std::vector<int> bigger(slots.size() * 2); // @line grow
    for (std::size_t i = 0; i < size; i++) {
      bigger[i] = slots[i]; // @line copy
    }
    slots = bigger; // @line grow-done
  }
};

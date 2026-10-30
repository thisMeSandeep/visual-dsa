#include <stdexcept>
#include <vector>

class Queue {
  std::vector<int> slots;
  std::size_t head = 0;  // slot of the front item
  std::size_t size = 0;

 public:
  explicit Queue(std::size_t capacity) : slots(capacity) {}

  void enqueue(int value) {
    if (size == slots.size()) { // @line check-full
      throw std::overflow_error("Queue is full"); // @line overflow
    }
    std::size_t tail = (head + size) % slots.size();
    slots[tail] = value; // @line enqueue
    size++; // @line enqueue
  }

  int dequeue() {
    if (size == 0) { // @line check-empty
      throw std::underflow_error("Queue is empty"); // @line underflow
    }
    int value = slots[head]; // @line read-front
    slots[head] = 0; // @line dequeue
    head = (head + 1) % slots.size(); // @line dequeue
    size--; // @line dequeue
    return value;
  }

  int front() const {
    if (size == 0) {
      throw std::out_of_range("Queue is empty"); // @line front-empty
    }
    return slots[head]; // @line front
  }

  void clear() {
    slots.assign(slots.size(), 0); // @line clear
    head = 0; // @line clear
    size = 0; // @line clear
  }
};

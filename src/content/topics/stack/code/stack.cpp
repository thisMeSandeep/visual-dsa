#include <map>
#include <stdexcept>
#include <string>
#include <vector>

class Stack {
  std::vector<int> items;
  std::size_t capacity;

 public:
  explicit Stack(std::size_t capacity) : capacity(capacity) {}

  void push(int value) {
    if (items.size() == capacity) { // @line check-full
      throw std::overflow_error("Stack overflow"); // @line overflow
    }
    items.push_back(value); // @line push
  }

  int pop() {
    if (items.empty()) { // @line check-empty
      throw std::underflow_error("Stack underflow"); // @line underflow
    }
    int top = items.back(); // @line read-top
    items.pop_back(); // @line pop
    return top; // @line pop
  }

  int peek() const {
    if (items.empty()) {
      throw std::out_of_range("Stack is empty"); // @line peek-empty
    }
    return items.back(); // @line peek
  }

  void clear() {
    items.clear(); // @line clear
  }

  bool empty() const { return items.empty(); }
};

bool isBalanced(const std::string& text) {
  const std::map<char, char> partners = {{')', '('}, {']', '['}, {'}', '{'}};
  Stack stack(text.size());
  for (char ch : text) { // @line scan
    if (std::string("([{").find(ch) != std::string::npos) {
      stack.push(ch); // @line push-open
    } else if (partners.count(ch)) {
      if (stack.empty()) {
        return false; // @line close-empty
      }
      if (stack.peek() != partners.at(ch)) { // @line close-match
        return false; // @line mismatch
      }
      stack.pop(); // @line pop-open
    }
  }
  if (!stack.empty()) {
    return false; // @line unclosed
  }
  return true; // @line balanced
}

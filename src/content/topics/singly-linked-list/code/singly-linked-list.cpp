#include <functional>
#include <stdexcept>

struct Node {
  int value;
  Node* next = nullptr;
  explicit Node(int value) : value(value) {}
};

class SinglyLinkedList {
  Node* head = nullptr;
  Node* tail = nullptr;  // only kept when keepTail is true
  bool keepTail;

 public:
  explicit SinglyLinkedList(bool keepTail) : keepTail(keepTail) {}

  void insertHead(int value) {
    Node* node = new Node(value); // @line head-create
    node->next = head; // @line head-link
    head = node; // @line head-move
    if (keepTail && tail == nullptr) tail = node; // @line head-move
  }

  void insertTail(int value) {
    Node* node = new Node(value); // @line tail-create
    if (head == nullptr) {
      head = node; // @line tail-empty
      if (keepTail) tail = node; // @line tail-empty
      return;
    }
    Node* last = tail;
    if (!keepTail) {
      last = head;
      while (last->next != nullptr) last = last->next; // @line walk
    }
    last->next = node; // @line tail-link
    if (keepTail) tail = node; // @line tail-move
  }

  Node* search(int value) const {
    Node* cur = head;
    while (cur != nullptr) {
      if (cur->value == value) { // @line search-compare
        return cur; // @line search-found
      }
      cur = cur->next; // @line search-compare
    }
    return nullptr; // @line search-not-found
  }

  void insertAfter(int target, int value) {
    Node* cur = search(target);
    if (cur == nullptr) throw std::invalid_argument("Not in the list"); // @line after-not-found
    Node* node = new Node(value); // @line after-create
    node->next = cur->next; // @line after-link
    cur->next = node; // @line after-relink
    if (tail == cur) tail = node; // @line after-relink
  }

  void remove(int value) {
    Node* prev = nullptr;
    Node* cur = head;
    while (cur != nullptr && cur->value != value) { // @line delete-find
      prev = cur; // @line delete-find
      cur = cur->next; // @line delete-find
    }
    if (cur == nullptr) return; // @line delete-not-found
    if (prev == nullptr) head = cur->next; // @line unlink-head
    else prev->next = cur->next; // @line unlink
    if (tail == cur) tail = prev; // @line unlink
    delete cur;
  }

  void traverse(const std::function<void(int)>& visit) const {
    Node* cur = head;
    while (cur != nullptr) {
      visit(cur->value); // @line traverse-visit
      cur = cur->next;
    }
  }

  void reverse() {
    if (keepTail) tail = head;
    Node* prev = nullptr;
    Node* cur = head;
    while (cur != nullptr) {
      Node* next = cur->next; // @line reverse-save
      cur->next = prev; // @line reverse-flip
      prev = cur; // @line reverse-advance
      cur = next; // @line reverse-advance
    }
    head = prev; // @line reverse-head
  }
};

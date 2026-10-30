#include <functional>
#include <stdexcept>

struct Node {
  int value;
  Node* prev = nullptr;
  Node* next = nullptr;
  explicit Node(int value) : value(value) {}
};

class DoublyLinkedList {
  Node* head = nullptr;
  Node* tail = nullptr;

 public:
  void insertHead(int value) {
    Node* node = new Node(value); // @line head-create
    node->next = head; // @line head-link
    if (head != nullptr) head->prev = node; // @line head-link-back
    head = node; // @line head-move
    if (tail == nullptr) tail = node; // @line head-move
  }

  void insertTail(int value) {
    Node* node = new Node(value); // @line tail-create
    if (tail == nullptr) {
      head = node; // @line tail-empty
      tail = node; // @line tail-empty
      return;
    }
    tail->next = node; // @line tail-link
    node->prev = tail; // @line tail-link-back
    tail = node; // @line tail-move
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
    node->prev = cur; // @line after-link
    if (cur->next != nullptr) cur->next->prev = node; // @line after-relink
    else tail = node; // @line after-relink
    cur->next = node; // @line after-relink
  }

  void insertBefore(int target, int value) {
    Node* cur = search(target);
    if (cur == nullptr) throw std::invalid_argument("Not in the list"); // @line before-not-found
    Node* node = new Node(value); // @line before-create
    node->next = cur; // @line before-link
    node->prev = cur->prev; // @line before-link
    if (cur->prev != nullptr) cur->prev->next = node; // @line before-relink
    else head = node; // @line before-relink
    cur->prev = node; // @line before-relink
  }

  void remove(int value) {
    Node* cur = head;
    while (cur != nullptr && cur->value != value) { // @line delete-find
      cur = cur->next; // @line delete-find
    }
    if (cur == nullptr) return; // @line delete-not-found
    if (cur->prev != nullptr) cur->prev->next = cur->next; // @line unlink-forward
    else head = cur->next; // @line unlink-forward
    if (cur->next != nullptr) cur->next->prev = cur->prev; // @line unlink-back
    else tail = cur->prev; // @line unlink-back
    delete cur;
  }

  void traverse(const std::function<void(int)>& visit) const {
    Node* cur = head;
    while (cur != nullptr) {
      visit(cur->value); // @line traverse-visit
      cur = cur->next;
    }
  }

  void traverseBackward(const std::function<void(int)>& visit) const {
    Node* cur = tail;
    while (cur != nullptr) {
      visit(cur->value); // @line back-visit
      cur = cur->prev;
    }
  }
};

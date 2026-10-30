class Node {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  insertHead(value) {
    const node = new Node(value); // @line head-create
    node.next = this.head; // @line head-link
    if (this.head !== null) this.head.prev = node; // @line head-link-back
    this.head = node; // @line head-move
    if (this.tail === null) this.tail = node; // @line head-move
  }

  insertTail(value) {
    const node = new Node(value); // @line tail-create
    if (this.tail === null) {
      this.head = node; // @line tail-empty
      this.tail = node; // @line tail-empty
      return;
    }
    this.tail.next = node; // @line tail-link
    node.prev = this.tail; // @line tail-link-back
    this.tail = node; // @line tail-move
  }

  search(value) {
    let cur = this.head;
    while (cur !== null) {
      if (cur.value === value) { // @line search-compare
        return cur; // @line search-found
      }
      cur = cur.next; // @line search-compare
    }
    return null; // @line search-not-found
  }

  insertAfter(target, value) {
    const cur = this.search(target);
    if (cur === null) throw new Error("Not in the list"); // @line after-not-found
    const node = new Node(value); // @line after-create
    node.next = cur.next; // @line after-link
    node.prev = cur; // @line after-link
    if (cur.next !== null) cur.next.prev = node; // @line after-relink
    else this.tail = node; // @line after-relink
    cur.next = node; // @line after-relink
  }

  insertBefore(target, value) {
    const cur = this.search(target);
    if (cur === null) throw new Error("Not in the list"); // @line before-not-found
    const node = new Node(value); // @line before-create
    node.next = cur; // @line before-link
    node.prev = cur.prev; // @line before-link
    if (cur.prev !== null) cur.prev.next = node; // @line before-relink
    else this.head = node; // @line before-relink
    cur.prev = node; // @line before-relink
  }

  delete(value) {
    let cur = this.head;
    while (cur !== null && cur.value !== value) { // @line delete-find
      cur = cur.next; // @line delete-find
    }
    if (cur === null) return; // @line delete-not-found
    if (cur.prev !== null) cur.prev.next = cur.next; // @line unlink-forward
    else this.head = cur.next; // @line unlink-forward
    if (cur.next !== null) cur.next.prev = cur.prev; // @line unlink-back
    else this.tail = cur.prev; // @line unlink-back
  }

  traverse(visit) {
    let cur = this.head;
    while (cur !== null) {
      visit(cur.value); // @line traverse-visit
      cur = cur.next;
    }
  }

  traverseBackward(visit) {
    let cur = this.tail;
    while (cur !== null) {
      visit(cur.value); // @line back-visit
      cur = cur.prev;
    }
  }
}

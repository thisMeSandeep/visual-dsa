class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class SinglyLinkedList {
  constructor(keepTail) {
    this.head = null;
    this.tail = null; // only kept when keepTail is true
    this.keepTail = keepTail;
  }

  insertHead(value) {
    const node = new Node(value); // @line head-create
    node.next = this.head; // @line head-link
    this.head = node; // @line head-move
    if (this.keepTail && this.tail === null) this.tail = node; // @line head-move
  }

  insertTail(value) {
    const node = new Node(value); // @line tail-create
    if (this.head === null) {
      this.head = node; // @line tail-empty
      if (this.keepTail) this.tail = node; // @line tail-empty
      return;
    }
    let last = this.tail;
    if (!this.keepTail) {
      last = this.head;
      while (last.next !== null) last = last.next; // @line walk
    }
    last.next = node; // @line tail-link
    if (this.keepTail) this.tail = node; // @line tail-move
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
    cur.next = node; // @line after-relink
    if (this.tail === cur) this.tail = node; // @line after-relink
  }

  delete(value) {
    let prev = null;
    let cur = this.head;
    while (cur !== null && cur.value !== value) { // @line delete-find
      prev = cur; // @line delete-find
      cur = cur.next; // @line delete-find
    }
    if (cur === null) return; // @line delete-not-found
    if (prev === null) this.head = cur.next; // @line unlink-head
    else prev.next = cur.next; // @line unlink
    if (this.tail === cur) this.tail = prev; // @line unlink
  }

  traverse(visit) {
    let cur = this.head;
    while (cur !== null) {
      visit(cur.value); // @line traverse-visit
      cur = cur.next;
    }
  }

  reverse() {
    if (this.keepTail) this.tail = this.head;
    let prev = null;
    let cur = this.head;
    while (cur !== null) {
      const next = cur.next; // @line reverse-save
      cur.next = prev; // @line reverse-flip
      prev = cur; // @line reverse-advance
      cur = next; // @line reverse-advance
    }
    this.head = prev; // @line reverse-head
  }
}

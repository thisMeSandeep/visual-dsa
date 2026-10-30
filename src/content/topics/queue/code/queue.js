class Queue {
  constructor(capacity) {
    this.slots = new Array(capacity);
    this.head = 0; // slot of the front item
    this.size = 0;
  }

  enqueue(value) {
    if (this.size === this.slots.length) { // @line check-full
      throw new Error("Queue is full"); // @line overflow
    }
    const tail = (this.head + this.size) % this.slots.length;
    this.slots[tail] = value; // @line enqueue
    this.size++; // @line enqueue
  }

  dequeue() {
    if (this.size === 0) { // @line check-empty
      throw new Error("Queue is empty"); // @line underflow
    }
    const value = this.slots[this.head]; // @line read-front
    this.slots[this.head] = undefined; // @line dequeue
    this.head = (this.head + 1) % this.slots.length; // @line dequeue
    this.size--; // @line dequeue
    return value;
  }

  front() {
    if (this.size === 0) {
      throw new Error("Queue is empty"); // @line front-empty
    }
    return this.slots[this.head]; // @line front
  }

  clear() {
    this.slots = new Array(this.slots.length); // @line clear
    this.head = 0; // @line clear
    this.size = 0; // @line clear
  }
}

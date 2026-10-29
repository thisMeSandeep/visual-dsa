class Stack {
  constructor(capacity) {
    this.items = [];
    this.capacity = capacity;
  }

  push(value) {
    if (this.items.length === this.capacity) { // @line check-full
      throw new Error("Stack overflow"); // @line overflow
    }
    this.items.push(value); // @line push
  }

  pop() {
    if (this.items.length === 0) { // @line check-empty
      throw new Error("Stack underflow"); // @line underflow
    }
    const top = this.items.at(-1); // @line read-top
    this.items.pop(); // @line pop
    return top; // @line pop
  }

  peek() {
    if (this.items.length === 0) {
      throw new Error("Stack is empty"); // @line peek-empty
    }
    return this.items.at(-1); // @line peek
  }

  clear() {
    this.items = []; // @line clear
  }
}

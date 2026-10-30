class DynamicArray {
  constructor(capacity) {
    this.slots = new Array(capacity);
    this.size = 0; // items are in slots 0 to size - 1
  }

  get(index) {
    if (index < 0 || index >= this.size) { // @line get-check
      throw new RangeError("Index out of bounds"); // @line get-out-of-bounds
    }
    return this.slots[index]; // @line get
  }

  set(index, value) {
    if (index < 0 || index >= this.size) { // @line set-check
      throw new RangeError("Index out of bounds"); // @line set-out-of-bounds
    }
    this.slots[index] = value; // @line set
  }

  push(value) {
    if (this.size === this.slots.length) this.grow(); // @line push-check
    this.slots[this.size] = value; // @line push
    this.size++; // @line push
  }

  insert(index, value) {
    if (index < 0 || index > this.size) { // @line insert-check
      throw new RangeError("Index out of bounds"); // @line insert-out-of-bounds
    }
    if (this.size === this.slots.length) this.grow();
    for (let j = this.size - 1; j >= index; j--) {
      this.slots[j + 1] = this.slots[j]; // @line shift-right
    }
    this.slots[index] = value; // @line insert
    this.size++; // @line insert
  }

  removeAt(index) {
    if (index < 0 || index >= this.size) { // @line remove-check
      throw new RangeError("Index out of bounds"); // @line remove-out-of-bounds
    }
    const value = this.slots[index]; // @line remove-read
    for (let j = index + 1; j < this.size; j++) {
      this.slots[j - 1] = this.slots[j]; // @line shift-left
    }
    this.size--; // @line remove-done
    this.slots[this.size] = undefined; // @line remove-done
    return value;
  }

  search(value) {
    for (let i = 0; i < this.size; i++) {
      if (this.slots[i] === value) { // @line search-compare
        return i; // @line search-found
      }
    }
    return -1; // @line search-not-found
  }

  traverse(visit) {
    for (let i = 0; i < this.size; i++) {
      visit(this.slots[i]); // @line traverse-visit
    }
  }

  grow() {
    const bigger = new Array(this.slots.length * 2); // @line grow
    for (let i = 0; i < this.size; i++) {
      bigger[i] = this.slots[i]; // @line copy
    }
    this.slots = bigger; // @line grow-done
  }
}

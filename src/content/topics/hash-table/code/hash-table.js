// Which bucket a key belongs in: hash it, then wrap the hash to the table's size.
function bucketOf(key, size) {
  let h = 0;
  for (const ch of key) h += ch.charCodeAt(0); // @line hash-fn
  return h % size; // @line hash-index
}
// A better hash mixes the letters as it goes: h = h * 31 + code.

class ChainedHashTable {
  constructor(size, loadLimit = 0.75) {
    this.buckets = Array.from({ length: size }, () => []);
    this.count = 0;
    this.loadLimit = loadLimit;
  }

  put(key, value) {
    const isNew = this.get(key) === undefined;
    if (isNew && (this.count + 1) / this.buckets.length > this.loadLimit) { // @line c-resize-check
      this.resize(); // @line c-resize-done
    }
    const chain = this.buckets[bucketOf(key, this.buckets.length)];
    for (const entry of chain) {
      if (entry.key === key) { // @line c-put-compare
        entry.value = value; // @line c-put-update
        return;
      }
    }
    chain.push({ key, value }); // @line c-put-append
    this.count++; // @line c-put-append
  }

  get(key) {
    const chain = this.buckets[bucketOf(key, this.buckets.length)];
    for (const entry of chain) {
      if (entry.key === key) { // @line c-get-compare
        return entry.value; // @line c-get-found
      }
    }
    return undefined; // @line c-get-missing
  }

  remove(key) {
    const chain = this.buckets[bucketOf(key, this.buckets.length)];
    for (let i = 0; i < chain.length; i++) {
      if (chain[i].key === key) { // @line c-remove-compare
        chain.splice(i, 1); // @line c-remove-unlink
        this.count--; // @line c-remove-unlink
        return;
      }
    }
    // not in the table: nothing to remove // @line c-remove-missing
  }

  resize() {
    const old = this.buckets; // @line c-resize
    this.buckets = Array.from({ length: old.length * 2 }, () => []); // @line c-resize
    for (const chain of old) {
      for (const entry of chain) {
        this.buckets[bucketOf(entry.key, this.buckets.length)].push(entry); // @line c-rehash
      }
    }
  }
}

const TOMBSTONE = { removed: true };

class ProbingHashTable {
  constructor(size, loadLimit = 0.75) {
    this.slots = new Array(size).fill(null);
    this.count = 0;
    this.loadLimit = loadLimit;
  }

  put(key, value) {
    const isNew = this.get(key) === undefined;
    if (isNew && (this.count + 1) / this.slots.length > this.loadLimit) { // @line p-resize-check
      this.resize(); // @line p-resize-done
    }
    const home = bucketOf(key, this.slots.length);
    let reuse = -1;
    for (let k = 0; k < this.slots.length; k++) {
      const i = (home + k) % this.slots.length;
      const slot = this.slots[i];
      if (slot === TOMBSTONE) {
        if (reuse < 0) reuse = i; // @line p-put-tombstone
      } else if (slot === null) {
        this.slots[reuse >= 0 ? reuse : i] = { key, value }; // @line p-put-place
        this.count++; // @line p-put-place
        return;
      } else if (slot.key === key) { // @line p-put-probe
        slot.value = value; // @line p-put-update
        return;
      }
    }
    if (reuse < 0) throw new Error("The table is full"); // @line p-full
    this.slots[reuse] = { key, value }; // @line p-put-place
    this.count++; // @line p-put-place
  }

  get(key) {
    const home = bucketOf(key, this.slots.length);
    for (let k = 0; k < this.slots.length; k++) { // @line p-get-probe
      const slot = this.slots[(home + k) % this.slots.length];
      if (slot === null) return undefined; // @line p-get-missing
      if (slot !== TOMBSTONE && slot.key === key) return slot.value; // @line p-get-found
    }
    return undefined; // @line p-get-missing
  }

  remove(key) {
    const home = bucketOf(key, this.slots.length);
    for (let k = 0; k < this.slots.length; k++) { // @line p-remove-probe
      const i = (home + k) % this.slots.length;
      if (this.slots[i] === null) return; // @line p-remove-missing
      if (this.slots[i] !== TOMBSTONE && this.slots[i].key === key) {
        this.slots[i] = TOMBSTONE; // @line p-remove-mark
        this.count--; // @line p-remove-mark
        return;
      }
    }
  }

  resize() {
    const old = this.slots; // @line p-resize
    this.slots = new Array(old.length * 2).fill(null); // @line p-resize
    this.count = 0;
    for (const slot of old) {
      if (slot !== null && slot !== TOMBSTONE) this.put(slot.key, slot.value); // @line p-rehash
    }
  }
}

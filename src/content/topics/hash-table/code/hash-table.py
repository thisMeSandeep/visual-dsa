# Which bucket a key belongs in: hash it, then wrap the hash to the table's size.
def bucket_of(key, size):
    h = 0
    for ch in key: h += ord(ch)  # @line hash-fn
    return h % size  # @line hash-index
# A better hash mixes the letters as it goes: h = h * 31 + code.


class ChainedHashTable:
    def __init__(self, size, load_limit=0.75):
        self.buckets = [[] for _ in range(size)]
        self.count = 0
        self.load_limit = load_limit

    def put(self, key, value):
        is_new = self.get(key) is None
        if is_new and (self.count + 1) / len(self.buckets) > self.load_limit:  # @line c-resize-check
            self.resize()  # @line c-resize-done
        chain = self.buckets[bucket_of(key, len(self.buckets))]
        for entry in chain:
            if entry[0] == key:  # @line c-put-compare
                entry[1] = value  # @line c-put-update
                return
        chain.append([key, value])  # @line c-put-append
        self.count += 1  # @line c-put-append

    def get(self, key):
        chain = self.buckets[bucket_of(key, len(self.buckets))]
        for entry in chain:
            if entry[0] == key:  # @line c-get-compare
                return entry[1]  # @line c-get-found
        return None  # @line c-get-missing

    def remove(self, key):
        chain = self.buckets[bucket_of(key, len(self.buckets))]
        for i in range(len(chain)):
            if chain[i][0] == key:  # @line c-remove-compare
                del chain[i]  # @line c-remove-unlink
                self.count -= 1  # @line c-remove-unlink
                return
        # not in the table: nothing to remove  # @line c-remove-missing

    def resize(self):
        old = self.buckets  # @line c-resize
        self.buckets = [[] for _ in range(len(old) * 2)]  # @line c-resize
        for chain in old:
            for entry in chain:
                self.buckets[bucket_of(entry[0], len(self.buckets))].append(entry)  # @line c-rehash


TOMBSTONE = object()


class ProbingHashTable:
    def __init__(self, size, load_limit=0.75):
        self.slots = [None] * size
        self.count = 0
        self.load_limit = load_limit

    def put(self, key, value):
        is_new = self.get(key) is None
        if is_new and (self.count + 1) / len(self.slots) > self.load_limit:  # @line p-resize-check
            self.resize()  # @line p-resize-done
        home = bucket_of(key, len(self.slots))
        reuse = -1
        for k in range(len(self.slots)):
            i = (home + k) % len(self.slots)
            slot = self.slots[i]
            if slot is TOMBSTONE:
                if reuse < 0: reuse = i  # @line p-put-tombstone
            elif slot is None:
                self.slots[reuse if reuse >= 0 else i] = [key, value]  # @line p-put-place
                self.count += 1  # @line p-put-place
                return
            elif slot[0] == key:  # @line p-put-probe
                slot[1] = value  # @line p-put-update
                return
        if reuse < 0: raise OverflowError("The table is full")  # @line p-full
        self.slots[reuse] = [key, value]  # @line p-put-place
        self.count += 1  # @line p-put-place

    def get(self, key):
        home = bucket_of(key, len(self.slots))
        for k in range(len(self.slots)):  # @line p-get-probe
            slot = self.slots[(home + k) % len(self.slots)]
            if slot is None: return None  # @line p-get-missing
            if slot is not TOMBSTONE and slot[0] == key: return slot[1]  # @line p-get-found
        return None  # @line p-get-missing

    def remove(self, key):
        home = bucket_of(key, len(self.slots))
        for k in range(len(self.slots)):  # @line p-remove-probe
            i = (home + k) % len(self.slots)
            if self.slots[i] is None: return  # @line p-remove-missing
            if self.slots[i] is not TOMBSTONE and self.slots[i][0] == key:
                self.slots[i] = TOMBSTONE  # @line p-remove-mark
                self.count -= 1  # @line p-remove-mark
                return

    def resize(self):
        old = self.slots  # @line p-resize
        self.slots = [None] * (len(old) * 2)  # @line p-resize
        self.count = 0
        for slot in old:
            if slot is not None and slot is not TOMBSTONE: self.put(slot[0], slot[1])  # @line p-rehash

import java.util.ArrayList;
import java.util.List;

class Hashing {
    // Which bucket a key belongs in: hash it, then wrap the hash to the table's size.
    static int bucketOf(String key, int size) {
        int h = 0;
        for (char ch : key.toCharArray()) h += ch; // @line hash-fn
        return h % size; // @line hash-index
    }
    // A better hash mixes the letters as it goes: h = h * 31 + code.
}

class Entry {
    final String key;
    int value;

    Entry(String key, int value) {
        this.key = key;
        this.value = value;
    }
}

class ChainedHashTable {
    private List<List<Entry>> buckets = new ArrayList<>();
    private int count = 0;
    private final double loadLimit;

    ChainedHashTable(int size, double loadLimit) {
        for (int i = 0; i < size; i++) buckets.add(new ArrayList<>());
        this.loadLimit = loadLimit;
    }

    void put(String key, int value) {
        boolean isNew = get(key) == null;
        if (isNew && (count + 1.0) / buckets.size() > loadLimit) { // @line c-resize-check
            resize(); // @line c-resize-done
        }
        List<Entry> chain = buckets.get(Hashing.bucketOf(key, buckets.size()));
        for (Entry entry : chain) {
            if (entry.key.equals(key)) { // @line c-put-compare
                entry.value = value; // @line c-put-update
                return;
            }
        }
        chain.add(new Entry(key, value)); // @line c-put-append
        count++; // @line c-put-append
    }

    Integer get(String key) {
        List<Entry> chain = buckets.get(Hashing.bucketOf(key, buckets.size()));
        for (Entry entry : chain) {
            if (entry.key.equals(key)) { // @line c-get-compare
                return entry.value; // @line c-get-found
            }
        }
        return null; // @line c-get-missing
    }

    void remove(String key) {
        List<Entry> chain = buckets.get(Hashing.bucketOf(key, buckets.size()));
        for (int i = 0; i < chain.size(); i++) {
            if (chain.get(i).key.equals(key)) { // @line c-remove-compare
                chain.remove(i); // @line c-remove-unlink
                count--; // @line c-remove-unlink
                return;
            }
        }
        // not in the table: nothing to remove // @line c-remove-missing
    }

    private void resize() {
        List<List<Entry>> old = buckets; // @line c-resize
        buckets = new ArrayList<>(); // @line c-resize
        for (int i = 0; i < old.size() * 2; i++) buckets.add(new ArrayList<>());
        for (List<Entry> chain : old) {
            for (Entry entry : chain) {
                buckets.get(Hashing.bucketOf(entry.key, buckets.size())).add(entry); // @line c-rehash
            }
        }
    }
}

class ProbingHashTable {
    private static final Entry TOMBSTONE = new Entry("", 0);
    private Entry[] slots;
    private int count = 0;
    private final double loadLimit;

    ProbingHashTable(int size, double loadLimit) {
        slots = new Entry[size];
        this.loadLimit = loadLimit;
    }

    void put(String key, int value) {
        boolean isNew = get(key) == null;
        if (isNew && (count + 1.0) / slots.length > loadLimit) { // @line p-resize-check
            resize(); // @line p-resize-done
        }
        int home = Hashing.bucketOf(key, slots.length);
        int reuse = -1;
        for (int k = 0; k < slots.length; k++) {
            int i = (home + k) % slots.length;
            Entry slot = slots[i];
            if (slot == TOMBSTONE) {
                if (reuse < 0) reuse = i; // @line p-put-tombstone
            } else if (slot == null) {
                slots[reuse >= 0 ? reuse : i] = new Entry(key, value); // @line p-put-place
                count++; // @line p-put-place
                return;
            } else if (slot.key.equals(key)) { // @line p-put-probe
                slot.value = value; // @line p-put-update
                return;
            }
        }
        if (reuse < 0) throw new IllegalStateException("The table is full"); // @line p-full
        slots[reuse] = new Entry(key, value); // @line p-put-place
        count++; // @line p-put-place
    }

    Integer get(String key) {
        int home = Hashing.bucketOf(key, slots.length);
        for (int k = 0; k < slots.length; k++) { // @line p-get-probe
            Entry slot = slots[(home + k) % slots.length];
            if (slot == null) return null; // @line p-get-missing
            if (slot != TOMBSTONE && slot.key.equals(key)) return slot.value; // @line p-get-found
        }
        return null; // @line p-get-missing
    }

    void remove(String key) {
        int home = Hashing.bucketOf(key, slots.length);
        for (int k = 0; k < slots.length; k++) { // @line p-remove-probe
            int i = (home + k) % slots.length;
            if (slots[i] == null) return; // @line p-remove-missing
            if (slots[i] != TOMBSTONE && slots[i].key.equals(key)) {
                slots[i] = TOMBSTONE; // @line p-remove-mark
                count--; // @line p-remove-mark
                return;
            }
        }
    }

    private void resize() {
        Entry[] old = slots; // @line p-resize
        slots = new Entry[old.length * 2]; // @line p-resize
        count = 0;
        for (Entry slot : old) {
            if (slot != null && slot != TOMBSTONE) put(slot.key, slot.value); // @line p-rehash
        }
    }
}

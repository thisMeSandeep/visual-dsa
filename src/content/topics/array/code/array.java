import java.util.function.IntConsumer;

class DynamicArray {
    private int[] slots;
    private int size = 0; // items are in slots 0 to size - 1

    DynamicArray(int capacity) {
        slots = new int[capacity];
    }

    int get(int index) {
        if (index < 0 || index >= size) { // @line get-check
            throw new IndexOutOfBoundsException("Index out of bounds"); // @line get-out-of-bounds
        }
        return slots[index]; // @line get
    }

    void set(int index, int value) {
        if (index < 0 || index >= size) { // @line set-check
            throw new IndexOutOfBoundsException("Index out of bounds"); // @line set-out-of-bounds
        }
        slots[index] = value; // @line set
    }

    void push(int value) {
        if (size == slots.length) grow(); // @line push-check
        slots[size] = value; // @line push
        size++; // @line push
    }

    void insert(int index, int value) {
        if (index < 0 || index > size) { // @line insert-check
            throw new IndexOutOfBoundsException("Index out of bounds"); // @line insert-out-of-bounds
        }
        if (size == slots.length) grow();
        for (int j = size - 1; j >= index; j--) {
            slots[j + 1] = slots[j]; // @line shift-right
        }
        slots[index] = value; // @line insert
        size++; // @line insert
    }

    int removeAt(int index) {
        if (index < 0 || index >= size) { // @line remove-check
            throw new IndexOutOfBoundsException("Index out of bounds"); // @line remove-out-of-bounds
        }
        int value = slots[index]; // @line remove-read
        for (int j = index + 1; j < size; j++) {
            slots[j - 1] = slots[j]; // @line shift-left
        }
        size--; // @line remove-done
        slots[size] = 0; // @line remove-done
        return value;
    }

    int search(int value) {
        for (int i = 0; i < size; i++) {
            if (slots[i] == value) { // @line search-compare
                return i; // @line search-found
            }
        }
        return -1; // @line search-not-found
    }

    void traverse(IntConsumer visit) {
        for (int i = 0; i < size; i++) {
            visit.accept(slots[i]); // @line traverse-visit
        }
    }

    private void grow() {
        int[] bigger = new int[slots.length * 2]; // @line grow
        for (int i = 0; i < size; i++) {
            bigger[i] = slots[i]; // @line copy
        }
        slots = bigger; // @line grow-done
    }
}

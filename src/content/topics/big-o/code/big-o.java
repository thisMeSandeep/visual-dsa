// Each method counts its steps, so you can see how the count grows with n.
class Growth {
    static int lookup(int[] items, int i) { // @line lookup-start
        int steps = 0;
        int item = items[i]; // @line lookup-step
        steps++; // @line lookup-step
        return steps; // @line lookup-done
    }

    static int loop(int[] items) { // @line loop-start
        int steps = 0;
        for (int item : items) {
            steps++; // @line loop-step
        }
        return steps; // @line loop-done
    }

    static int nested(int[] items) { // @line nested-start
        int steps = 0;
        for (int a : items) {
            for (int b : items) {
                steps++; // @line nested-step
            }
        }
        return steps; // @line nested-done
    }

    static int halving(int n) { // @line halving-start
        int steps = 0;
        while (n > 1) {
            n = n / 2; // @line halving-step
            steps++; // @line halving-step
        }
        return steps; // @line halving-done
    }

    // Best and worst case: linear search stops as soon as it finds the value.
    static int search(int[] items, int value) {
        for (int i = 0; i < items.length; i++) {
            if (items[i] == value) { // @line search-compare
                return i; // @line search-found
            }
        }
        return -1; // @line search-not-found
    }
}

// Amortised cost: push is quick, except when a full array doubles.
class GrowingArray {
    int[] slots = new int[1];
    int size = 0;

    void push(int value) {
        if (size == slots.length) grow(); // @line push-check
        slots[size] = value; // @line push
        size++; // @line push
    }

    void grow() {
        int[] bigger = new int[slots.length * 2]; // @line grow
        for (int i = 0; i < size; i++) {
            bigger[i] = slots[i]; // @line copy
        }
        slots = bigger; // @line grow-done
    }
}

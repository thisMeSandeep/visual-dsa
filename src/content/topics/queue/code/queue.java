class Queue {
    private Integer[] slots;
    private int head = 0; // slot of the front item
    private int size = 0;

    Queue(int capacity) {
        slots = new Integer[capacity];
    }

    void enqueue(int value) {
        if (size == slots.length) { // @line check-full
            throw new IllegalStateException("Queue is full"); // @line overflow
        }
        int tail = (head + size) % slots.length;
        slots[tail] = value; // @line enqueue
        size++; // @line enqueue
    }

    int dequeue() {
        if (size == 0) { // @line check-empty
            throw new IllegalStateException("Queue is empty"); // @line underflow
        }
        int value = slots[head]; // @line read-front
        slots[head] = null; // @line dequeue
        head = (head + 1) % slots.length; // @line dequeue
        size--; // @line dequeue
        return value;
    }

    int front() {
        if (size == 0) {
            throw new IllegalStateException("Queue is empty"); // @line front-empty
        }
        return slots[head]; // @line front
    }

    void clear() {
        slots = new Integer[slots.length]; // @line clear
        head = 0; // @line clear
        size = 0; // @line clear
    }
}

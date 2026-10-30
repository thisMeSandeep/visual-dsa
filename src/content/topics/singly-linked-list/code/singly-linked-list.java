import java.util.function.IntConsumer;

class Node {
    int value;
    Node next;

    Node(int value) {
        this.value = value;
    }
}

class SinglyLinkedList {
    Node head;
    Node tail; // only kept when keepTail is true
    final boolean keepTail;

    SinglyLinkedList(boolean keepTail) {
        this.keepTail = keepTail;
    }

    void insertHead(int value) {
        Node node = new Node(value); // @line head-create
        node.next = head; // @line head-link
        head = node; // @line head-move
        if (keepTail && tail == null) tail = node; // @line head-move
    }

    void insertTail(int value) {
        Node node = new Node(value); // @line tail-create
        if (head == null) {
            head = node; // @line tail-empty
            if (keepTail) tail = node; // @line tail-empty
            return;
        }
        Node last = tail;
        if (!keepTail) {
            last = head;
            while (last.next != null) last = last.next; // @line walk
        }
        last.next = node; // @line tail-link
        if (keepTail) tail = node; // @line tail-move
    }

    Node search(int value) {
        Node cur = head;
        while (cur != null) {
            if (cur.value == value) { // @line search-compare
                return cur; // @line search-found
            }
            cur = cur.next; // @line search-compare
        }
        return null; // @line search-not-found
    }

    void insertAfter(int target, int value) {
        Node cur = search(target);
        if (cur == null) throw new IllegalArgumentException("Not in the list"); // @line after-not-found
        Node node = new Node(value); // @line after-create
        node.next = cur.next; // @line after-link
        cur.next = node; // @line after-relink
        if (tail == cur) tail = node; // @line after-relink
    }

    void delete(int value) {
        Node prev = null;
        Node cur = head;
        while (cur != null && cur.value != value) { // @line delete-find
            prev = cur; // @line delete-find
            cur = cur.next; // @line delete-find
        }
        if (cur == null) return; // @line delete-not-found
        if (prev == null) head = cur.next; // @line unlink-head
        else prev.next = cur.next; // @line unlink
        if (tail == cur) tail = prev; // @line unlink
    }

    void traverse(IntConsumer visit) {
        Node cur = head;
        while (cur != null) {
            visit.accept(cur.value); // @line traverse-visit
            cur = cur.next;
        }
    }

    void reverse() {
        if (keepTail) tail = head;
        Node prev = null;
        Node cur = head;
        while (cur != null) {
            Node next = cur.next; // @line reverse-save
            cur.next = prev; // @line reverse-flip
            prev = cur; // @line reverse-advance
            cur = next; // @line reverse-advance
        }
        head = prev; // @line reverse-head
    }
}

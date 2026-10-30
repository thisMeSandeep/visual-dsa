class Node:
    def __init__(self, value):
        self.value = value
        self.prev = None
        self.next = None


class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def insert_head(self, value):
        node = Node(value)  # @line head-create
        node.next = self.head  # @line head-link
        if self.head is not None: self.head.prev = node  # @line head-link-back
        self.head = node  # @line head-move
        if self.tail is None: self.tail = node  # @line head-move

    def insert_tail(self, value):
        node = Node(value)  # @line tail-create
        if self.tail is None:
            self.head = node  # @line tail-empty
            self.tail = node  # @line tail-empty
            return
        self.tail.next = node  # @line tail-link
        node.prev = self.tail  # @line tail-link-back
        self.tail = node  # @line tail-move

    def search(self, value):
        cur = self.head
        while cur is not None:
            if cur.value == value:  # @line search-compare
                return cur  # @line search-found
            cur = cur.next  # @line search-compare
        return None  # @line search-not-found

    def insert_after(self, target, value):
        cur = self.search(target)
        if cur is None: raise ValueError("Not in the list")  # @line after-not-found
        node = Node(value)  # @line after-create
        node.next = cur.next  # @line after-link
        node.prev = cur  # @line after-link
        if cur.next is not None: cur.next.prev = node  # @line after-relink
        else: self.tail = node  # @line after-relink
        cur.next = node  # @line after-relink

    def insert_before(self, target, value):
        cur = self.search(target)
        if cur is None: raise ValueError("Not in the list")  # @line before-not-found
        node = Node(value)  # @line before-create
        node.next = cur  # @line before-link
        node.prev = cur.prev  # @line before-link
        if cur.prev is not None: cur.prev.next = node  # @line before-relink
        else: self.head = node  # @line before-relink
        cur.prev = node  # @line before-relink

    def delete(self, value):
        cur = self.head
        while cur is not None and cur.value != value:  # @line delete-find
            cur = cur.next  # @line delete-find
        if cur is None: return  # @line delete-not-found
        if cur.prev is not None: cur.prev.next = cur.next  # @line unlink-forward
        else: self.head = cur.next  # @line unlink-forward
        if cur.next is not None: cur.next.prev = cur.prev  # @line unlink-back
        else: self.tail = cur.prev  # @line unlink-back

    def traverse(self, visit):
        cur = self.head
        while cur is not None:
            visit(cur.value)  # @line traverse-visit
            cur = cur.next

    def traverse_backward(self, visit):
        cur = self.tail
        while cur is not None:
            visit(cur.value)  # @line back-visit
            cur = cur.prev

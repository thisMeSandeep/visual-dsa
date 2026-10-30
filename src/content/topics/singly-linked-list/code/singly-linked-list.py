class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


class SinglyLinkedList:
    def __init__(self, keep_tail):
        self.head = None
        self.tail = None  # only kept when keep_tail is True
        self.keep_tail = keep_tail

    def insert_head(self, value):
        node = Node(value)  # @line head-create
        node.next = self.head  # @line head-link
        self.head = node  # @line head-move
        if self.keep_tail and self.tail is None: self.tail = node  # @line head-move

    def insert_tail(self, value):
        node = Node(value)  # @line tail-create
        if self.head is None:
            self.head = node  # @line tail-empty
            if self.keep_tail: self.tail = node  # @line tail-empty
            return
        last = self.tail
        if not self.keep_tail:
            last = self.head
            while last.next is not None: last = last.next  # @line walk
        last.next = node  # @line tail-link
        if self.keep_tail: self.tail = node  # @line tail-move

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
        cur.next = node  # @line after-relink
        if self.tail is cur: self.tail = node  # @line after-relink

    def delete(self, value):
        prev = None
        cur = self.head
        while cur is not None and cur.value != value:  # @line delete-find
            prev = cur  # @line delete-find
            cur = cur.next  # @line delete-find
        if cur is None: return  # @line delete-not-found
        if prev is None: self.head = cur.next  # @line unlink-head
        else: prev.next = cur.next  # @line unlink
        if self.tail is cur: self.tail = prev  # @line unlink

    def traverse(self, visit):
        cur = self.head
        while cur is not None:
            visit(cur.value)  # @line traverse-visit
            cur = cur.next

    def reverse(self):
        if self.keep_tail: self.tail = self.head
        prev = None
        cur = self.head
        while cur is not None:
            nxt = cur.next  # @line reverse-save
            cur.next = prev  # @line reverse-flip
            prev = cur  # @line reverse-advance
            cur = nxt  # @line reverse-advance
        self.head = prev  # @line reverse-head

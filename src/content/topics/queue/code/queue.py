class Queue:
    def __init__(self, capacity):
        self.slots = [None] * capacity
        self.head = 0  # slot of the front item
        self.size = 0

    def enqueue(self, value):
        if self.size == len(self.slots):  # @line check-full
            raise OverflowError("Queue is full")  # @line overflow
        tail = (self.head + self.size) % len(self.slots)
        self.slots[tail] = value  # @line enqueue
        self.size += 1  # @line enqueue

    def dequeue(self):
        if self.size == 0:  # @line check-empty
            raise IndexError("Queue is empty")  # @line underflow
        value = self.slots[self.head]  # @line read-front
        self.slots[self.head] = None  # @line dequeue
        self.head = (self.head + 1) % len(self.slots)  # @line dequeue
        self.size -= 1  # @line dequeue
        return value

    def front(self):
        if self.size == 0:
            raise IndexError("Queue is empty")  # @line front-empty
        return self.slots[self.head]  # @line front

    def clear(self):
        self.slots = [None] * len(self.slots)  # @line clear
        self.head = 0  # @line clear
        self.size = 0  # @line clear

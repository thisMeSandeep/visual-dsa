class DynamicArray:
    def __init__(self, capacity):
        self.slots = [None] * capacity
        self.size = 0  # items are in slots 0 to size - 1

    def get(self, index):
        if index < 0 or index >= self.size:  # @line get-check
            raise IndexError("Index out of bounds")  # @line get-out-of-bounds
        return self.slots[index]  # @line get

    def set(self, index, value):
        if index < 0 or index >= self.size:  # @line set-check
            raise IndexError("Index out of bounds")  # @line set-out-of-bounds
        self.slots[index] = value  # @line set

    def push(self, value):
        if self.size == len(self.slots): self.grow()  # @line push-check
        self.slots[self.size] = value  # @line push
        self.size += 1  # @line push

    def insert(self, index, value):
        if index < 0 or index > self.size:  # @line insert-check
            raise IndexError("Index out of bounds")  # @line insert-out-of-bounds
        if self.size == len(self.slots): self.grow()
        for j in range(self.size - 1, index - 1, -1):
            self.slots[j + 1] = self.slots[j]  # @line shift-right
        self.slots[index] = value  # @line insert
        self.size += 1  # @line insert

    def remove_at(self, index):
        if index < 0 or index >= self.size:  # @line remove-check
            raise IndexError("Index out of bounds")  # @line remove-out-of-bounds
        value = self.slots[index]  # @line remove-read
        for j in range(index + 1, self.size):
            self.slots[j - 1] = self.slots[j]  # @line shift-left
        self.size -= 1  # @line remove-done
        self.slots[self.size] = None  # @line remove-done
        return value

    def search(self, value):
        for i in range(self.size):
            if self.slots[i] == value:  # @line search-compare
                return i  # @line search-found
        return -1  # @line search-not-found

    def traverse(self, visit):
        for i in range(self.size):
            visit(self.slots[i])  # @line traverse-visit

    def grow(self):
        bigger = [None] * (len(self.slots) * 2)  # @line grow
        for i in range(self.size):
            bigger[i] = self.slots[i]  # @line copy
        self.slots = bigger  # @line grow-done

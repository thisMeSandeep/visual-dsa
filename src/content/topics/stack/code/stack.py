class Stack:
    def __init__(self, capacity):
        self.items = []
        self.capacity = capacity

    def push(self, value):
        if len(self.items) == self.capacity:  # @line check-full
            raise OverflowError("Stack overflow")  # @line overflow
        self.items.append(value)  # @line push

    def pop(self):
        if len(self.items) == 0:  # @line check-empty
            raise IndexError("Stack underflow")  # @line underflow
        top = self.items[-1]  # @line read-top
        self.items.pop()  # @line pop
        return top  # @line pop

    def peek(self):
        if len(self.items) == 0:
            raise IndexError("Stack is empty")  # @line peek-empty
        return self.items[-1]  # @line peek

    def clear(self):
        self.items = []  # @line clear


def is_balanced(text):
    partners = {")": "(", "]": "[", "}": "{"}
    stack = Stack(len(text))
    for ch in text:  # @line scan
        if ch in "([{":
            stack.push(ch)  # @line push-open
        elif ch in partners:
            if len(stack.items) == 0:
                return False  # @line close-empty
            if stack.peek() != partners[ch]:  # @line close-match
                return False  # @line mismatch
            stack.pop()  # @line pop-open
    if len(stack.items) > 0:
        return False  # @line unclosed
    return True  # @line balanced

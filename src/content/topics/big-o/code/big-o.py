# Each function counts its steps, so you can see how the count grows with n.

def lookup(items, i):  # @line lookup-start
    steps = 0
    item = items[i]  # @line lookup-step
    steps += 1  # @line lookup-step
    return steps  # @line lookup-done


def loop(items):  # @line loop-start
    steps = 0
    for item in items:
        steps += 1  # @line loop-step
    return steps  # @line loop-done


def nested(items):  # @line nested-start
    steps = 0
    for a in items:
        for b in items:
            steps += 1  # @line nested-step
    return steps  # @line nested-done


def halving(n):  # @line halving-start
    steps = 0
    while n > 1:
        n = n // 2  # @line halving-step
        steps += 1  # @line halving-step
    return steps  # @line halving-done


# Best and worst case: linear search stops as soon as it finds the value.
def search(items, value):
    for i in range(len(items)):
        if items[i] == value:  # @line search-compare
            return i  # @line search-found
    return -1  # @line search-not-found


# Amortised cost: push is quick, except when a full array doubles.
def push(array, value):
    if array.size == len(array.slots): grow(array)  # @line push-check
    array.slots[array.size] = value  # @line push
    array.size += 1  # @line push


def grow(array):
    bigger = [None] * (len(array.slots) * 2)  # @line grow
    for i in range(array.size):
        bigger[i] = array.slots[i]  # @line copy
    array.slots = bigger  # @line grow-done

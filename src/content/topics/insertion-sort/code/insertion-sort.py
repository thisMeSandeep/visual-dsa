# Sorts a in place, smallest first.

def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]  # @line take
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]  # @line shift
            j -= 1
        a[j + 1] = key  # @line insert

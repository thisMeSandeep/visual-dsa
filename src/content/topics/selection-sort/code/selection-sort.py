# Sorts a in place, smallest first.

def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        smallest = i  # @line scan
        for j in range(i + 1, n):
            if a[j] < a[smallest]:  # @line compare
                smallest = j  # @line new-min
        if smallest != i:  # @line place
            a[i], a[smallest] = a[smallest], a[i]  # @line swap

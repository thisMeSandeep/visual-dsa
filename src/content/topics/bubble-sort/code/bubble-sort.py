# Sorts a in place, smallest first.

def bubble_sort(a):
    n = len(a)
    for pass_ in range(1, n):
        swapped = False
        for j in range(n - pass_):
            if a[j] > a[j + 1]:  # @line compare
                a[j], a[j + 1] = a[j + 1], a[j]  # @line swap
                swapped = True  # @line swap
        # a[n - pass_] is now in place  # @line pass-done
        if not swapped: return  # @line early-exit

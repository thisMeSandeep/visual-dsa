import random

# Sorts a[lo..hi], smallest first.

def quick_sort(a, lo=0, hi=None, random_pivot=False):
    if hi is None: hi = len(a) - 1
    if lo >= hi: return
    p = partition(a, lo, hi, random_pivot)
    quick_sort(a, lo, p - 1, random_pivot)
    quick_sort(a, p + 1, hi, random_pivot)


# Lomuto: the pivot is the last item.
def partition(a, lo, hi, random_pivot):
    if random_pivot:
        r = random.randint(lo, hi); a[r], a[hi] = a[hi], a[r]  # @line random-pivot
    pivot = a[hi]  # @line pivot
    i = lo  # @line pivot
    for j in range(lo, hi):
        if a[j] <= pivot:  # @line compare
            a[i], a[j] = a[j], a[i]  # @line swap
            i += 1
    a[i], a[hi] = a[hi], a[i]  # @line place
    return i

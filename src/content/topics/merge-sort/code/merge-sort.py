# Sorts a[lo..hi - 1], smallest first.

def merge_sort(a, lo=0, hi=None):
    if hi is None: hi = len(a)
    if hi - lo < 2: return
    mid = (lo + hi) // 2  # @line split
    merge_sort(a, lo, mid)
    merge_sort(a, mid, hi)
    merge(a, lo, mid, hi)


def merge(a, lo, mid, hi):
    left = a[lo:mid]
    right = a[mid:hi]
    i = j = 0
    k = lo
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            a[k] = left[i]; i += 1  # @line take-left
        else:
            a[k] = right[j]; j += 1  # @line take-right
        k += 1
    rest = left[i:] + right[j:]
    a[k:hi] = rest  # @line rest

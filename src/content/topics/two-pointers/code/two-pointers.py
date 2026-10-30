# Two indices moving through one list.

def reverse(a):
    left, right = 0, len(a) - 1  # @line reverse-start
    while left < right:
        a[left], a[right] = a[right], a[left]  # @line reverse-swap
        left, right = left + 1, right - 1  # @line reverse-swap
    return a  # @line reverse-done


# a is sorted, smallest first.
def pair_sum(a, target):
    left, right = 0, len(a) - 1  # @line pair-start
    while left < right:
        total = a[left] + a[right]
        if total == target: return (left, right)  # @line pair-found
        if total < target:
            left += 1  # @line pair-left
        else:
            right -= 1  # @line pair-right
    return None  # @line pair-none


# a is sorted. Keeps one of each value at the front.
def remove_duplicates(a):
    write = 1  # @line dedupe-start
    for read in range(1, len(a)):
        if a[read] == a[write - 1]: continue  # @line dedupe-skip
        a[write] = a[read]  # @line dedupe-keep
        write += 1  # @line dedupe-keep
    return write  # @line dedupe-done

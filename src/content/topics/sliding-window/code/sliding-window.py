from collections import deque


# The biggest sum of k neighbours.
def max_sum(a, k):
    total = sum(a[:k])  # @line sum-start
    best = total  # @line sum-start
    for right in range(k, len(a)):
        total += a[right] - a[right - k]  # @line sum-slide
        best = max(best, total)  # @line sum-slide
    return best  # @line sum-done


# The longest run with no repeated value.
def longest_unique(a):
    seen, left, best = set(), 0, 0  # @line unique-start
    for right in range(len(a)):
        while a[right] in seen:
            seen.remove(a[left]); left += 1  # @line unique-shrink
        seen.add(a[right])  # @line unique-grow
        best = max(best, right - left + 1)  # @line unique-grow
    return best  # @line unique-done


# The biggest item in each window of k. The deque holds
# indices whose values go down from front to back.
def window_max(a, k):
    window, maxima = deque(), []  # @line max-start
    for right in range(len(a)):
        if window and window[0] < right - k + 1: window.popleft()  # @line max-expire
        while window and a[window[-1]] <= a[right]:
            window.pop()  # @line max-pop
        window.append(right)  # @line max-push
        if right >= k - 1: maxima.append(a[window[0]])  # @line max-record
    return maxima

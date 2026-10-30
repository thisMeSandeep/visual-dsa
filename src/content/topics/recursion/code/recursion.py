def fact(n):
    if n <= 1: return 1  # @line fact-base
    rest = fact(n - 1)  # @line fact-call
    return n * rest  # @line fact-return


def fib(n):
    if n <= 1: return n  # @line fib-base
    a = fib(n - 1)  # @line fib-left
    b = fib(n - 2)  # @line fib-right
    return a + b  # @line fib-return


# Memoised: each answer is saved the first time.
def fib_memo(n, memo=None):
    if memo is None: memo = {}
    if n in memo: return memo[n]  # @line memo-hit
    if n <= 1: return n  # @line memo-base
    a = fib_memo(n - 1, memo)  # @line memo-left
    b = fib_memo(n - 2, memo)  # @line memo-right
    memo[n] = a + b  # @line memo-store
    return memo[n]  # @line memo-store


# Broken: no base case, so it never stops.
def broken_fact(n):
    return n * broken_fact(n - 1)  # @line broken-call

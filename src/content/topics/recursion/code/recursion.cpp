#include <unordered_map>

long long fact(int n) {
  if (n <= 1) return 1; // @line fact-base
  long long rest = fact(n - 1); // @line fact-call
  return n * rest; // @line fact-return
}

long long fib(int n) {
  if (n <= 1) return n; // @line fib-base
  long long a = fib(n - 1); // @line fib-left
  long long b = fib(n - 2); // @line fib-right
  return a + b; // @line fib-return
}

// Memoised: each answer is saved the first time.
long long fibMemo(int n, std::unordered_map<int, long long>& memo) {
  if (memo.count(n)) return memo[n]; // @line memo-hit
  if (n <= 1) return n; // @line memo-base
  long long a = fibMemo(n - 1, memo); // @line memo-left
  long long b = fibMemo(n - 2, memo); // @line memo-right
  memo[n] = a + b; // @line memo-store
  return memo[n]; // @line memo-store
}

// Broken: no base case, so it never stops.
long long brokenFact(int n) {
  return n * brokenFact(n - 1); // @line broken-call
}

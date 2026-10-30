function fact(n) {
  if (n <= 1) return 1; // @line fact-base
  const rest = fact(n - 1); // @line fact-call
  return n * rest; // @line fact-return
}

function fib(n) {
  if (n <= 1) return n; // @line fib-base
  const a = fib(n - 1); // @line fib-left
  const b = fib(n - 2); // @line fib-right
  return a + b; // @line fib-return
}

// Memoised: each answer is saved the first time.
function fibMemo(n, memo = new Map()) {
  if (memo.has(n)) return memo.get(n); // @line memo-hit
  if (n <= 1) return n; // @line memo-base
  const a = fibMemo(n - 1, memo); // @line memo-left
  const b = fibMemo(n - 2, memo); // @line memo-right
  memo.set(n, a + b); // @line memo-store
  return memo.get(n); // @line memo-store
}

// Broken: no base case, so it never stops.
function brokenFact(n) {
  return n * brokenFact(n - 1); // @line broken-call
}

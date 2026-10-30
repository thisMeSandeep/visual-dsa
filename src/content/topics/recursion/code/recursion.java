import java.util.HashMap;
import java.util.Map;

class Recursion {
    static long fact(int n) {
        if (n <= 1) return 1; // @line fact-base
        long rest = fact(n - 1); // @line fact-call
        return n * rest; // @line fact-return
    }

    static long fib(int n) {
        if (n <= 1) return n; // @line fib-base
        long a = fib(n - 1); // @line fib-left
        long b = fib(n - 2); // @line fib-right
        return a + b; // @line fib-return
    }

    // Memoised: each answer is saved the first time.
    static long fibMemo(int n, Map<Integer, Long> memo) {
        if (memo.containsKey(n)) return memo.get(n); // @line memo-hit
        if (n <= 1) return n; // @line memo-base
        long a = fibMemo(n - 1, memo); // @line memo-left
        long b = fibMemo(n - 2, memo); // @line memo-right
        memo.put(n, a + b); // @line memo-store
        return memo.get(n); // @line memo-store
    }

    // Broken: no base case, so it never stops.
    static long brokenFact(int n) {
        return n * brokenFact(n - 1); // @line broken-call
    }
}

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

class SlidingWindow {
    // The biggest sum of k neighbours.
    static int maxSum(int[] a, int k) {
        int sum = 0; for (int i = 0; i < k; i++) sum += a[i]; // @line sum-start
        int best = sum; // @line sum-start
        for (int right = k; right < a.length; right++) {
            sum += a[right] - a[right - k]; // @line sum-slide
            best = Math.max(best, sum); // @line sum-slide
        }
        return best; // @line sum-done
    }

    // The longest run with no repeated value.
    static int longestUnique(int[] a) {
        Set<Integer> seen = new HashSet<>(); int left = 0, best = 0; // @line unique-start
        for (int right = 0; right < a.length; right++) {
            while (seen.contains(a[right])) {
                seen.remove(a[left++]); // @line unique-shrink
            }
            seen.add(a[right]); // @line unique-grow
            best = Math.max(best, right - left + 1); // @line unique-grow
        }
        return best; // @line unique-done
    }

    // The biggest item in each window of k. The deque holds
    // indices whose values go down from front to back.
    static List<Integer> windowMax(int[] a, int k) {
        ArrayDeque<Integer> deque = new ArrayDeque<>(); List<Integer> maxima = new ArrayList<>(); // @line max-start
        for (int right = 0; right < a.length; right++) {
            if (!deque.isEmpty() && deque.peekFirst() < right - k + 1) deque.pollFirst(); // @line max-expire
            while (!deque.isEmpty() && a[deque.peekLast()] <= a[right]) {
                deque.pollLast(); // @line max-pop
            }
            deque.addLast(right); // @line max-push
            if (right >= k - 1) maxima.add(a[deque.peekFirst()]); // @line max-record
        }
        return maxima;
    }
}

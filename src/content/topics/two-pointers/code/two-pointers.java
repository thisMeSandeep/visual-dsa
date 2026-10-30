// Two indices moving through one array.
class TwoPointers {
    static int[] reverse(int[] a) {
        int left = 0, right = a.length - 1; // @line reverse-start
        while (left < right) {
            int t = a[left]; a[left] = a[right]; a[right] = t; // @line reverse-swap
            left++; right--; // @line reverse-swap
        }
        return a; // @line reverse-done
    }

    // a is sorted, smallest first.
    static int[] pairSum(int[] a, int target) {
        int left = 0, right = a.length - 1; // @line pair-start
        while (left < right) {
            int sum = a[left] + a[right];
            if (sum == target) return new int[] {left, right}; // @line pair-found
            if (sum < target) {
                left++; // @line pair-left
            } else {
                right--; // @line pair-right
            }
        }
        return null; // @line pair-none
    }

    // a is sorted. Keeps one of each value at the front.
    static int removeDuplicates(int[] a) {
        int write = 1; // @line dedupe-start
        for (int read = 1; read < a.length; read++) {
            if (a[read] == a[write - 1]) continue; // @line dedupe-skip
            a[write] = a[read]; // @line dedupe-keep
            write++; // @line dedupe-keep
        }
        return write; // @line dedupe-done
    }
}

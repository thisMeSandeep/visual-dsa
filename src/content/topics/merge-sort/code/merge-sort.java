import java.util.Arrays;

// Sorts a[lo..hi - 1], smallest first. Start with mergeSort(a, 0, a.length).
class MergeSort {
    static void mergeSort(int[] a, int lo, int hi) {
        if (hi - lo < 2) return;
        int mid = (lo + hi) / 2; // @line split
        mergeSort(a, lo, mid);
        mergeSort(a, mid, hi);
        merge(a, lo, mid, hi);
    }

    static void merge(int[] a, int lo, int mid, int hi) {
        int[] left = Arrays.copyOfRange(a, lo, mid);
        int[] right = Arrays.copyOfRange(a, mid, hi);
        int i = 0, j = 0, k = lo;
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                a[k++] = left[i++]; // @line take-left
            } else {
                a[k++] = right[j++]; // @line take-right
            }
        }
        while (i < left.length) a[k++] = left[i++]; // @line rest
        while (j < right.length) a[k++] = right[j++]; // @line rest
    }
}

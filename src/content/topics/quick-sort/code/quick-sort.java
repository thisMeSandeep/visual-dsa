import java.util.concurrent.ThreadLocalRandom;

// Sorts a[lo..hi], smallest first. Start with quickSort(a, 0, a.length - 1, false).
class QuickSort {
    static void quickSort(int[] a, int lo, int hi, boolean randomPivot) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi, randomPivot);
        quickSort(a, lo, p - 1, randomPivot);
        quickSort(a, p + 1, hi, randomPivot);
    }

    // Lomuto: the pivot is the last item.
    static int partition(int[] a, int lo, int hi, boolean randomPivot) {
        if (randomPivot) swap(a, ThreadLocalRandom.current().nextInt(lo, hi + 1), hi); // @line random-pivot
        int pivot = a[hi]; // @line pivot
        int i = lo; // @line pivot
        for (int j = lo; j < hi; j++) {
            if (a[j] <= pivot) { // @line compare
                swap(a, i, j); // @line swap
                i++;
            }
        }
        swap(a, i, hi); // @line place
        return i;
    }

    static void swap(int[] a, int i, int j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}

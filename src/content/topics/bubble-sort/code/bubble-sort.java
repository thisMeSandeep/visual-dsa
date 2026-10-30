// Sorts a in place, smallest first.
class BubbleSort {
    static void bubbleSort(int[] a) {
        int n = a.length;
        for (int pass = 1; pass < n; pass++) {
            boolean swapped = false;
            for (int j = 0; j < n - pass; j++) {
                if (a[j] > a[j + 1]) { // @line compare
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; // @line swap
                    swapped = true; // @line swap
                }
            } // @line pass-done
            if (!swapped) return; // @line early-exit
        }
    }
}
